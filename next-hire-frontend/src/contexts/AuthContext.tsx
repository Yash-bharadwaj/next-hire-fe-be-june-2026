import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import {
  User,
  UserRole,
  AuthContextType,
  SignupRequest,
  LoginRequest,
  LoginOTPRequest,
  VerifyOTPRequest,
  ResendOTPRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set user helper
  const setUserData = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  // Load latest profile from backend
  const loadProfile = useCallback(async () => {
    const profile = await authService.getProfile();
    setUserData(profile.user);
    return profile.user;
  }, [setUserData]);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = authService.getCurrentUser();
        const storedToken = authService.getToken();

        if (storedUser && storedToken) {
          setUserData(storedUser);
        }

        if (!storedToken) {
          setIsLoading(false);
          return;
        }

        setToken(storedToken);
        await loadProfile();
      } catch (error) {
        console.error("Error initializing auth:", error);
        authService.clearAuthData();
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [loadProfile, setUserData]);

  // Signup
  const signup = useCallback(async (data: SignupRequest) => {
    try {
      setIsLoading(true);
      const response = await authService.signup(data);

      // Check if email was sent successfully
      if ((response as any).emailSent === false) {
        toast.warning(
          "Account created, but OTP email could not be sent. Please use the 'Resend OTP' option.",
          { duration: 5000 }
        );
      } else {
        toast.success(
          "Account created successfully! Please check your email for verification code."
        );
      }
      return response;
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verify OTP
  const verifyOTP = useCallback(async (data: VerifyOTPRequest) => {
    try {
      setIsLoading(true);
      const response = await authService.verifyOTP(data);
      setUserData(response.user);
      // Handle both 'token' and 'accessToken' from backend
      const token = (response as any).token || (response as any).accessToken;
      setToken(token);
      toast.success("Email verified successfully!");
      return response;
    } catch (error: any) {
      toast.error(error.message || "OTP verification failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Resend OTP
  const resendOTP = useCallback(async (data: ResendOTPRequest) => {
    try {
      await authService.resendOTP(data);
      toast.success("Verification code sent to your email!");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend OTP");
      throw error;
    }
  }, []);

  // Login
  const login = useCallback(async (data: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authService.login(data);
      console.log("AuthContext login - response:", response);
      setUserData(response.user);
      // Handle both 'token' and 'accessToken' from backend
      const token = (response as any).token || (response as any).accessToken;
      console.log("AuthContext login - extracted token:", token);
      setToken(token);
      console.log("AuthContext login - user and token set");
      toast.success("Login successful!");
      return response;
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Request login OTP
  const requestLoginOTP = useCallback(
    async (data: ResendOTPRequest) => {
      try {
        setIsLoading(true);
        await authService.requestLoginOTP(data);
        toast.success("Login code sent to your email");
      } catch (error: any) {
        toast.error(error.message || "Failed to send login code");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Login with OTP
  const loginWithOTP = useCallback(
    async (data: LoginOTPRequest) => {
      try {
        setIsLoading(true);
        const response = await authService.loginWithOTP(data);
        setUserData(response.user);
        const token = (response as any).token || (response as any).accessToken;
        setToken(token);
        toast.success("Login successful!");
        return response;
      } catch (error: any) {
        toast.error(error.message || "Login failed");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [setUserData]
  );

  // Logout
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      setToken(null);
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error);
      // Clear local state even if API call fails
      setUser(null);
      setToken(null);
      authService.clearAuthData();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Forgot Password
  const forgotPassword = useCallback(async (data: ForgotPasswordRequest) => {
    try {
      await authService.forgotPassword(data);
      toast.success("Password reset link sent to your email!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
      throw error;
    }
  }, []);

  // Reset Password
  const resetPassword = useCallback(async (data: ResetPasswordRequest) => {
    try {
      await authService.resetPassword(data);
      toast.success("Password reset successfully!");
    } catch (error: any) {
      toast.error(error.message || "Password reset failed");
      throw error;
    }
  }, []);

  // Change Password
  const changePassword = useCallback(async (data: ChangePasswordRequest) => {
    try {
      await authService.changePassword(data);
      toast.success("Password changed successfully!");
    } catch (error: any) {
      toast.error(error.message || "Password change failed");
      throw error;
    }
  }, []);

  // Refresh Token
  const refreshTokenFn = useCallback(async () => {
    try {
      const newToken = await authService.refreshToken();
      setToken(newToken);
      return newToken;
    } catch (error: any) {
      console.error("Token refresh failed:", error);
      setUser(null);
      setToken(null);
      throw error;
    }
  }, []);

  // Clear auth state
  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    authService.clearAuthData();
  }, []);

  // Update user role (for role selection)
  const updateUserRole = useCallback(
    (role: UserRole) => {
      if (user) {
        const updatedUser = { ...user, role };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    },
    [user]
  );

  const value: AuthContextType = {
    // State
    user,
    token,
    isAuthenticated: !!(user && token),
    isLoading,

    // Actions
    signup,
    verifyOTP,
    resendOTP,
    login,
    loginWithOTP,
    requestLoginOTP,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    refreshToken: refreshTokenFn,

    // Utilities
    clearAuth,
    setUser: setUserData,
    updateUserRole,
    loadProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Re-export types for convenience
export type { User, UserRole };
