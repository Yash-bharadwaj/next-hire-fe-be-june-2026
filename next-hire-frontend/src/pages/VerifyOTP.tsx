import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft, Mail, RefreshCw, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendOTP, isLoading } = useAuth();

  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Get email from location state or redirect
  const email = location.state?.email;
  const message = location.state?.message;

  useEffect(() => {
    if (!email) {
      navigate("/auth/login");
      return;
    }
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    try {
      const response = await verifyOTP({ email, otp });

      // Redirect to dashboard - view will change based on user role
      navigate("/dashboard");
    } catch (error) {
      console.error("OTP verification failed:", error);
      setOtp(""); // Clear OTP on error
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsResending(true);
      await resendOTP({ email });
      setTimeLeft(300); // Reset timer
      setCanResend(false);
    } catch (error) {
      console.error("Resend OTP failed:", error);
    } finally {
      setIsResending(false);
    }
  };

  const handleOTPChange = (value: string) => {
    setOtp(value);

    // Auto-submit when 6 digits are entered
    if (value.length === 6) {
      setTimeout(() => {
        const form = document.getElementById("otp-form") as HTMLFormElement;
        form?.requestSubmit();
      }, 100);
    }
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-green-100/50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27 width=%2732%27 height=%2732%27 fill=%27none%27 stroke=%27rgb(34 197 94 / 0.03)%27%3e%3cpath d=%27m0 .5 32 32M32 .5 0 32%27/%3e%3c/svg%3e')] bg-top"></div>

      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-green-200/20 to-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-emerald-200/15 to-green-300/15 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Back Button */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/auth/login")}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
        </div>

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-green-500/25 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
            <Mail className="text-white w-8 h-8 relative z-10" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Verify Your Email
          </h2>
          <p className="text-green-600/70 font-medium">
            We sent a 6-digit code to
          </p>
          <p className="text-green-700 font-semibold">{email}</p>
        </div>

        {/* Alert Message */}
        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 text-sm font-medium">{message}</p>
          </div>
        )}

        {/* OTP Form */}
        <Card className="border-0 shadow-2xl shadow-green-500/10 bg-white/95 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-white/80 to-emerald-50/30"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600"></div>

          <CardHeader className="space-y-1 pb-6 relative z-10">
            <CardTitle className="text-2xl text-center bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
              Enter Verification Code
            </CardTitle>
            <CardDescription className="text-center text-green-600/70">
              Enter the 6-digit code sent to your email
            </CardDescription>
          </CardHeader>

          <CardContent className="relative z-10">
            <form id="otp-form" onSubmit={handleSubmit} className="space-y-6">
              {/* OTP Input */}
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={handleOTPChange}
                  disabled={isLoading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={0}
                      className="w-12 h-12 text-lg border-green-200 focus:border-green-400"
                    />
                    <InputOTPSlot
                      index={1}
                      className="w-12 h-12 text-lg border-green-200 focus:border-green-400"
                    />
                    <InputOTPSlot
                      index={2}
                      className="w-12 h-12 text-lg border-green-200 focus:border-green-400"
                    />
                    <InputOTPSlot
                      index={3}
                      className="w-12 h-12 text-lg border-green-200 focus:border-green-400"
                    />
                    <InputOTPSlot
                      index={4}
                      className="w-12 h-12 text-lg border-green-200 focus:border-green-400"
                    />
                    <InputOTPSlot
                      index={5}
                      className="w-12 h-12 text-lg border-green-200 focus:border-green-400"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {/* Timer and Resend */}
              <div className="text-center space-y-4">
                {!canResend ? (
                  <p className="text-green-600/70 text-sm">
                    Code expires in{" "}
                    <span className="font-semibold text-green-700">
                      {formatTime(timeLeft)}
                    </span>
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-green-600/70 text-sm">
                      Didn't receive the code?
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleResendOTP}
                      disabled={isResending}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      {isResending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Resend Code
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 hover:from-green-700 hover:via-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/30 hover:scale-[1.02] relative overflow-hidden group"
                disabled={isLoading || otp.length !== 6}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center justify-center">
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLoading ? "Verifying..." : "Verify Email"}
                </span>
              </Button>
            </form>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-green-600/70">
                Having trouble?{" "}
                <Link
                  to="/support"
                  className="font-semibold text-green-600 hover:text-green-700 hover:underline transition-colors"
                >
                  Contact Support
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
