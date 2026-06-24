import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";

// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
const API_VERSION = "v1";

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// On these endpoints a 401 means "invalid credentials" / "not verified", not
// "session expired" - skip the refresh-retry flow so the real error message
// (e.g. "Invalid credentials") reaches the caller instead of "No refresh token".
const AUTH_ENDPOINTS_WITHOUT_REFRESH = [
  "/auth/login",
  "/auth/signup",
  "/auth/refresh-token",
  "/auth/verify-otp",
  "/auth/resend-otp",
  "/auth/login-otp/request",
  "/auth/login-otp/verify",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// Refresh queue — prevents multiple concurrent 401s each triggering a separate refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token!)));
  failedQueue = [];
};

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAuthEndpoint = AUTH_ENDPOINTS_WITHOUT_REFRESH.some((path) =>
        originalRequest.url?.includes(path)
      );
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      // If a refresh is already in flight, queue this request until it resolves
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = localStorage.getItem("refreshToken");
        if (!storedRefreshToken) throw new Error("No refresh token");

        // Use a raw axios call — not the intercepted `api` instance — to avoid loops
        const response = await axios.post(
          `${API_BASE_URL}/api/${API_VERSION}/auth/refresh-token`,
          { refreshToken: storedRefreshToken }
        );

        // Backend returns { accessToken, refreshToken } (not { token })
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem("token", accessToken);
        if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response?.status === 429) {
      throw new Error("Too many requests. Please try again later.");
    }

    if ((error.response?.status ?? 0) >= 500) {
      // Some 5xx responses carry a specific, actionable message (e.g. "AI
      // parsing is temporarily unavailable") - prefer that over the generic
      // fallback so the user isn't left with a black-box error.
      const backendMessage = (error.response?.data as any)?.message;
      throw new Error(backendMessage || "Server error. Please try again later.");
    }

    return Promise.reject(error);
  }
);

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// When K is omitted, falls back to the original union of possible list-key
// names (used by existing callers). Passing K gives a precise, single-key
// shape instead, e.g. PaginatedResponse<Job, "jobs">.
export interface PaginatedResponse<T, K extends string = never> {
  success: boolean;
  data: ([K] extends [never]
    ? {
        items?: T[];
        jobs?: T[];
        candidates?: T[];
        submissions?: T[];
        tasks?: T[];
      }
    : Record<K, T[]>) & {
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

// Generic API methods
export const apiClient = {
  // `timeout` can be overridden for slow operations (e.g. AI-powered match
  // reranking, which makes LLM calls per candidate and can take longer than
  // the default).
  get: <T>(url: string, params?: any, timeout?: number): Promise<AxiosResponse<ApiResponse<T>>> =>
    api.get(url, { params, timeout }),

  post: <T>(url: string, data?: any, timeout?: number): Promise<AxiosResponse<ApiResponse<T>>> =>
    api.post(url, data, { timeout }),

  put: <T>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> =>
    api.put(url, data),

  delete: <T>(url: string): Promise<AxiosResponse<ApiResponse<T>>> =>
    api.delete(url),

  patch: <T>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> =>
    api.patch(url, data),

  // For multipart/form-data uploads. Unsets the default JSON Content-Type so
  // axios/the browser can set the correct multipart boundary automatically.
  // `timeout` can be overridden for slow operations (e.g. AI document parsing).
  upload: <T>(
    url: string,
    formData: FormData,
    timeout?: number
  ): Promise<AxiosResponse<ApiResponse<T>>> =>
    api.post(url, formData, { headers: { "Content-Type": undefined }, timeout }),
};

// Resolves a stored document key/path (resume file_url, attachment url,
// etc.) to a fresh, currently-fetchable URL just before the browser
// navigates to it. Needed because S3-backed keys aren't directly fetchable
// (private bucket) and presigned URLs resolved at upload time expire after
// an hour - this always asks the backend for a current one. Already-absolute
// URLs (e.g. the local-disk attachments flow, which builds a full URL at
// upload time) are returned as-is since they need no resolution.
export const resolveDocumentUrl = async (key?: string | null): Promise<string> => {
  if (!key) return "";
  if (key.startsWith("http://") || key.startsWith("https://")) return key;

  const response = await apiClient.get<{ url: string }>("/files/resolve", { key });
  const url = response.data.data?.url || "";
  if (!url) return "";
  // Local-storage mode resolves to a server-relative path (e.g.
  // "/uploads/documents/xyz.pdf") rather than an absolute URL - needs the
  // API origin prefixed, since the browser would otherwise resolve it
  // against the frontend's own origin.
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

// Browsers can't render DOCX/legacy DOC inline, so the document preview
// dialog falls back to this for non-PDF/image files: ask the backend to
// extract plain text (same libraries used for résumé parsing) and render
// that instead of a dead end. Throws on unsupported/empty files - the caller
// is expected to show that message rather than treat it as a hard error.
export const fetchDocumentPreviewText = async (key: string): Promise<{ text: string; truncated: boolean }> => {
  const response = await apiClient.get<{ text: string; truncated: boolean }>("/files/preview-text", { key });
  return response.data.data!;
};

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data.status === "OK";
  } catch (error) {
    console.error("Health check failed:", error);
    return false;
  }
};

export default api;
