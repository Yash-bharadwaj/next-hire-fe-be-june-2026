import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  User,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await signup({
        email: formData.email,
        password: formData.password,
        role: "recruiter",
        first_name: formData.firstName,
        last_name: formData.lastName,
      });

      // Navigate to OTP verification
      navigate("/auth/verify-otp", {
        state: {
          email: formData.email,
          message:
            "Please check your email for the verification code to complete your registration.",
        },
      });
    } catch (error) {
      console.error("Signup failed:", error);
      // Error is already shown via toast in AuthContext
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-green-100/50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27 width=%2732%27 height=%2732%27 fill=%27none%27 stroke=%27rgb(34 197 94 / 0.03)%27%3e%3cpath d=%27m0 .5 32 32M32 .5 0 32%27/%3e%3c/svg%3e')] bg-top"></div>

      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-green-200/20 to-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-emerald-200/15 to-green-300/15 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-green-500/25 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
            <Building2 className="text-white w-8 h-8 relative z-10" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Join as Recruiter
          </h2>
          <p className="text-green-600/70 font-medium">
            Create your recruiter account
          </p>
        </div>

        {/* Signup Form */}
        <Card className="border-0 shadow-2xl shadow-green-500/10 bg-white/95 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-white/80 to-emerald-50/30"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600"></div>

          <CardHeader className="space-y-1 pb-6 relative z-10">
            <CardTitle className="text-2xl text-center bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
              Create Account
            </CardTitle>
            <CardDescription className="text-center text-green-600/70">
              Start hiring the best talent today
            </CardDescription>
          </CardHeader>

          <CardContent className="relative z-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-green-700 font-medium"
                  >
                    First Name
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5 transition-colors group-focus-within:text-green-600" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleChange("firstName", e.target.value)
                      }
                      className={`pl-11 h-12 transition-all duration-300 hover:bg-white/90 ${
                        errors.firstName
                          ? "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                          : "border-green-200/50 focus:border-green-400 focus:ring-green-400/20 bg-white/70 backdrop-blur-sm"
                      }`}
                      required
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-500 text-sm">{errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-green-700 font-medium"
                  >
                    Last Name
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5 transition-colors group-focus-within:text-green-600" />
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      className={`pl-11 h-12 transition-all duration-300 hover:bg-white/90 ${
                        errors.lastName
                          ? "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                          : "border-green-200/50 focus:border-green-400 focus:ring-green-400/20 bg-white/70 backdrop-blur-sm"
                      }`}
                      required
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-500 text-sm">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-green-700 font-medium">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5 transition-colors group-focus-within:text-green-600" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@company.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`pl-11 h-12 transition-all duration-300 hover:bg-white/90 ${
                      errors.email
                        ? "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                        : "border-green-200/50 focus:border-green-400 focus:ring-green-400/20 bg-white/70 backdrop-blur-sm"
                    }`}
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-green-700 font-medium"
                >
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5 transition-colors group-focus-within:text-green-600" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className={`pl-11 pr-12 h-12 transition-all duration-300 hover:bg-white/90 ${
                      errors.password
                        ? "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                        : "border-green-200/50 focus:border-green-400 focus:ring-green-400/20 bg-white/70 backdrop-blur-sm"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 hover:text-green-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
                <p className="text-xs text-green-600/70">
                  Minimum 8 characters with letters and numbers
                </p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-green-700 font-medium"
                >
                  Confirm Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5 transition-colors group-focus-within:text-green-600" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleChange("confirmPassword", e.target.value)
                    }
                    className={`pl-11 h-12 transition-all duration-300 hover:bg-white/90 ${
                      errors.confirmPassword
                        ? "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                        : "border-green-200/50 focus:border-green-400 focus:ring-green-400/20 bg-white/70 backdrop-blur-sm"
                    }`}
                    required
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 hover:from-green-700 hover:via-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/30 hover:scale-[1.02] relative overflow-hidden group"
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center justify-center">
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLoading
                    ? "Creating Account..."
                    : "Create Recruiter Account"}
                </span>
              </Button>
            </form>

            {/* Divider */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-green-200/60" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/90 text-green-600/80 font-medium">
                    Already have an account?
                  </span>
                </div>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <Link
                to="/auth/login"
                className="font-semibold text-green-600 hover:text-green-700 hover:underline transition-colors"
              >
                Sign in to your account
              </Link>
            </div>

            {/* Other Role Links */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-green-600/80">
                Looking to join as a different role?
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  to="/auth/signup-candidate"
                  className="text-sm font-semibold text-green-600 hover:text-green-700 hover:underline transition-colors"
                >
                  Candidate
                </Link>
                <span className="text-green-500/60">•</span>
                <Link
                  to="/auth/signup-vendor"
                  className="text-sm font-semibold text-green-600 hover:text-green-700 hover:underline transition-colors"
                >
                  Vendor
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
