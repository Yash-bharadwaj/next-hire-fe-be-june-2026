// User roles matching backend
export type UserRole = "candidate" | "recruiter" | "vendor" | "admin" | "client";

// User interface matching backend response
export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: "active" | "inactive" | "suspended";
  email_verified: boolean;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string | null;
  created_at: string;
  updated_at: string;
  last_login_at?: string | null;
}

// Authentication request/response types
export interface SignupRequest {
  email: string;
  password: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company_name?: string;
  contact_name?: string;
}

export interface SignupResponse {
  userId: string;
  email: string;
  role: UserRole;
  emailSent?: boolean;
  warning?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginOTPRequest {
  email: string;
  otp: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}
 
export interface AuthProfileResponse {
  user: User;
  profile?: Record<string, any> | null;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface ResendOTPRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Auth context types
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  signup: (data: SignupRequest) => Promise<SignupResponse>;
  verifyOTP: (data: VerifyOTPRequest) => Promise<LoginResponse>;
  resendOTP: (data: ResendOTPRequest) => Promise<void>;
  login: (data: LoginRequest) => Promise<LoginResponse>;
  loginWithOTP: (data: LoginOTPRequest) => Promise<LoginResponse>;
  requestLoginOTP: (data: ResendOTPRequest) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordRequest) => Promise<void>;
  resetPassword: (data: ResetPasswordRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  refreshToken: () => Promise<string>;

  // Utilities
  clearAuth: () => void;
  setUser: (user: User) => void;
  updateUserRole: (role: UserRole) => void;
  loadProfile: () => Promise<User>;
}

// Error types
export interface AuthError {
  message: string;
  field?: string;
  code?: string;
}

// OTP verification states
export interface OTPVerificationState {
  email: string;
  isVerifying: boolean;
  canResend: boolean;
  timeLeft: number;
}
