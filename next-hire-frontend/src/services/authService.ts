import { apiClient, ApiResponse } from "@/lib/api";
import {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginOTPRequest,
  LoginResponse,
  VerifyOTPRequest,
  ResendOTPRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  RefreshTokenRequest,
  User,
  AuthProfileResponse,
} from "@/types/auth";

class AuthService {
  /**
   * User signup
   */
  async signup(data: SignupRequest): Promise<SignupResponse> {
    try {
      const response = await apiClient.post<SignupResponse>(
        "/auth/signup",
        data
      );
      return response.data.data!;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify OTP after signup
   */
  async verifyOTP(data: VerifyOTPRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        "/auth/verify-otp",
        data
      );
      const authData = response.data.data!;

      // Store tokens and user data
      this.storeAuthData(authData);

      return authData;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Resend OTP
   */
  async resendOTP(data: ResendOTPRequest): Promise<void> {
    try {
      await apiClient.post("/auth/resend-otp", data);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * User login
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>("/auth/login", data);
      const authData = response.data.data!;

      // Store tokens and user data
      this.storeAuthData(authData);

      return authData;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Request login OTP for passwordless login
   */
  async requestLoginOTP(data: ResendOTPRequest): Promise<void> {
    try {
      await apiClient.post("/auth/login-otp/request", data);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Login with OTP (passwordless)
   */
  async loginWithOTP(data: LoginOTPRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        "/auth/login-otp/verify",
        data
      );
      const authData = response.data.data!;

      this.storeAuthData(authData);
      return authData;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * User logout
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn("Logout API call failed:", error);
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    try {
      await apiClient.post("/auth/forgot-password", data);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    try {
      await apiClient.post("/auth/reset-password", data);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Change password (authenticated)
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    try {
      await apiClient.post("/auth/change-password", data);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await apiClient.post<{
        token: string;
        refreshToken: string;
      }>("/auth/refresh-token", {
        refreshToken,
      });

      const { token, refreshToken: newRefreshToken } = response.data.data!;

      // Update stored tokens
      localStorage.setItem("token", token);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }

      return token;
    } catch (error: any) {
      this.clearAuthData();
      throw this.handleError(error);
    }
  }

  /**
   * Fetch current authenticated user profile
   */
  async getProfile(): Promise<AuthProfileResponse> {
    try {
      const response = await apiClient.get<AuthProfileResponse>("/auth/me");
      const profileData = response.data.data;

      if (!profileData || !profileData.user) {
        throw new Error("Invalid profile response");
      }

      localStorage.setItem("user", JSON.stringify(profileData.user));

      return profileData;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current user from token/storage
   */
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }

  /**
   * Get stored access token
   */
  getToken(): string | null {
    return localStorage.getItem("token");
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem("refreshToken");
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  /**
   * Store authentication data
   */
  private storeAuthData(data: any): void {
    // Handle both 'token' and 'accessToken' from backend
    const token = data.token || data.accessToken;
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  /**
   * Clear authentication data
   */
  clearAuthData(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error.response?.data?.errors?.length > 0) {
      const firstError = error.response.data.errors[0];
      return new Error(firstError.message);
    }

    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }

    if (error.message) {
      return new Error(error.message);
    }

    return new Error("An unexpected error occurred");
  }

  /**
   * Check if email needs verification
   */
  needsEmailVerification(user: User): boolean {
    return !user.email_verified;
  }

  /**
   * Get user display name
   */
  getUserDisplayName(user: User): string {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) {
      return user.first_name;
    }
    return user.email;
  }

  /**
   * Get role display name
   */
  getRoleDisplayName(role: string): string {
    const roleMap: Record<string, string> = {
      candidate: "Candidate",
      recruiter: "Recruiter",
      vendor: "Vendor",
    };
    return roleMap[role] || role;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
