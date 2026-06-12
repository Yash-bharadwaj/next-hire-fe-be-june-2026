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

interface OTPTheme {
  pageBg: string;
  decorStroke: string;
  orb1: string;
  orb2: string;
  linkBtn: string;
  iconGradient: string;
  iconShadow: string;
  headingGradient: string;
  mutedText: string;
  emphasisText: string;
  alertBg: string;
  alertText: string;
  cardShadow: string;
  cardBgGradient: string;
  cardTopBar: string;
  cardTitleGradient: string;
  otpSlot: string;
  submitGradient: string;
  submitShadow: string;
  helpLink: string;
}

const OTP_THEMES: Record<"default" | "candidate" | "vendor", OTPTheme> = {
  default: {
    pageBg: "bg-gradient-to-br from-green-50 via-emerald-50/30 to-green-100/50",
    decorStroke: "rgb(34 197 94 / 0.03)",
    orb1: "bg-gradient-to-r from-green-200/20 to-emerald-200/20",
    orb2: "bg-gradient-to-r from-emerald-200/15 to-green-300/15",
    linkBtn: "text-green-600 hover:text-green-700 hover:bg-green-50",
    iconGradient: "bg-gradient-to-br from-green-600 via-green-500 to-emerald-500",
    iconShadow: "shadow-lg shadow-green-500/25",
    headingGradient: "bg-gradient-to-r from-green-700 via-green-600 to-emerald-600",
    mutedText: "text-green-600/70",
    emphasisText: "text-green-700",
    alertBg: "bg-green-50 border border-green-200",
    alertText: "text-green-700",
    cardShadow: "shadow-2xl shadow-green-500/10",
    cardBgGradient: "bg-gradient-to-br from-green-50/50 via-white/80 to-emerald-50/30",
    cardTopBar: "bg-gradient-to-r from-green-500 via-emerald-500 to-green-600",
    cardTitleGradient: "bg-gradient-to-r from-green-700 to-emerald-600",
    otpSlot: "border-green-200 focus:border-green-400",
    submitGradient: "bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 hover:from-green-700 hover:via-green-600 hover:to-emerald-600",
    submitShadow: "shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30",
    helpLink: "text-green-600 hover:text-green-700",
  },
  candidate: {
    pageBg: "bg-gradient-to-br from-candidate-50 via-white to-candidate-100/50",
    decorStroke: "rgb(114 92 173 / 0.03)",
    orb1: "bg-gradient-to-r from-candidate-200/20 to-candidate-300/20",
    orb2: "bg-gradient-to-r from-candidate-300/15 to-candidate-200/15",
    linkBtn: "text-candidate-600 hover:text-candidate-700 hover:bg-candidate-50",
    iconGradient: "bg-gradient-to-br from-candidate-600 via-candidate-500 to-candidate-400",
    iconShadow: "shadow-lg shadow-candidate-500/25",
    headingGradient: "bg-gradient-to-r from-candidate-700 via-candidate-600 to-candidate-500",
    mutedText: "text-candidate-600/70",
    emphasisText: "text-candidate-700",
    alertBg: "bg-candidate-50 border border-candidate-200",
    alertText: "text-candidate-700",
    cardShadow: "shadow-2xl shadow-candidate-500/10",
    cardBgGradient: "bg-gradient-to-br from-candidate-50/50 via-white/80 to-candidate-100/30",
    cardTopBar: "bg-gradient-to-r from-candidate-500 via-candidate-400 to-candidate-600",
    cardTitleGradient: "bg-gradient-to-r from-candidate-700 to-candidate-500",
    otpSlot: "border-candidate-200 focus:border-candidate-400",
    submitGradient: "bg-gradient-to-r from-candidate-600 via-candidate-500 to-candidate-400 hover:from-candidate-700 hover:via-candidate-600 hover:to-candidate-500",
    submitShadow: "shadow-lg shadow-candidate-500/25 hover:shadow-xl hover:shadow-candidate-500/30",
    helpLink: "text-candidate-600 hover:text-candidate-700",
  },
  vendor: {
    pageBg: "bg-gradient-to-br from-vendor-50 via-white to-vendor-100/50",
    decorStroke: "rgb(164 204 217 / 0.03)",
    orb1: "bg-gradient-to-r from-vendor-200/20 to-vendor-300/20",
    orb2: "bg-gradient-to-r from-vendor-300/15 to-vendor-200/15",
    linkBtn: "text-vendor-600 hover:text-vendor-700 hover:bg-vendor-50",
    iconGradient: "bg-gradient-to-br from-vendor-600 via-vendor-500 to-vendor-400",
    iconShadow: "shadow-lg shadow-vendor-500/25",
    headingGradient: "bg-gradient-to-r from-vendor-700 via-vendor-600 to-vendor-500",
    mutedText: "text-vendor-600/70",
    emphasisText: "text-vendor-700",
    alertBg: "bg-vendor-50 border border-vendor-200",
    alertText: "text-vendor-700",
    cardShadow: "shadow-2xl shadow-vendor-500/10",
    cardBgGradient: "bg-gradient-to-br from-vendor-50/50 via-white/80 to-vendor-100/30",
    cardTopBar: "bg-gradient-to-r from-vendor-500 via-vendor-400 to-vendor-600",
    cardTitleGradient: "bg-gradient-to-r from-vendor-700 to-vendor-500",
    otpSlot: "border-vendor-200 focus:border-vendor-400",
    submitGradient: "bg-gradient-to-r from-vendor-600 via-vendor-500 to-vendor-400 hover:from-vendor-700 hover:via-vendor-600 hover:to-vendor-500",
    submitShadow: "shadow-lg shadow-vendor-500/25 hover:shadow-xl hover:shadow-vendor-500/30",
    helpLink: "text-vendor-600 hover:text-vendor-700",
  },
};

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

  // Match the styling of whichever signup flow led here (candidate/vendor),
  // falling back to the default green theme for login/company signup.
  const themeKey = (location.state?.theme as "candidate" | "vendor" | undefined) ?? "default";
  const theme = OTP_THEMES[themeKey];

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
    <div className={`h-screen ${theme.pageBg} flex items-center justify-center p-4 relative overflow-hidden`}>
      {/* Background decoration */}
      <div className={`absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27 width=%2732%27 height=%2732%27 fill=%27none%27 stroke=%27${theme.decorStroke}%27%3e%3cpath d=%27m0 .5 32 32M32 .5 0 32%27/%3e%3c/svg%3e')] bg-top`}></div>

      {/* Floating orbs */}
      <div className={`absolute top-20 left-20 w-72 h-72 ${theme.orb1} rounded-full blur-3xl animate-pulse`}></div>
      <div className={`absolute bottom-20 right-20 w-96 h-96 ${theme.orb2} rounded-full blur-3xl animate-pulse [animation-delay:1s]`}></div>

      <div className="w-full max-w-md space-y-4 relative z-10">
        {/* Back Button */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/auth/login")}
            className={theme.linkBtn}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
        </div>

        {/* Header */}
        <div className="text-center">
          <div className={`mx-auto w-12 h-12 ${theme.iconGradient} rounded-2xl flex items-center justify-center mb-3 ${theme.iconShadow} relative`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
            <Mail className="text-white w-6 h-6 relative z-10" />
          </div>
          <h2 className={`text-2xl font-bold ${theme.headingGradient} bg-clip-text text-transparent mb-1`}>
            Verify Your Email
          </h2>
          <p className={`${theme.mutedText} text-sm font-medium`}>
            We sent a 6-digit code to{" "}
            <span className={`${theme.emphasisText} font-semibold`}>{email}</span>
          </p>
        </div>

        {/* Alert Message */}
        {message && (
          <div className={`${theme.alertBg} rounded-lg px-4 py-2`}>
            <p className={`${theme.alertText} text-sm font-medium`}>{message}</p>
          </div>
        )}

        {/* OTP Form */}
        <Card className={`border-0 ${theme.cardShadow} bg-white/95 backdrop-blur-xl relative overflow-hidden`}>
          <div className={`absolute inset-0 ${theme.cardBgGradient}`}></div>
          <div className={`absolute top-0 left-0 w-full h-1 ${theme.cardTopBar}`}></div>

          <CardHeader className="space-y-1 pb-3 pt-5 relative z-10">
            <CardTitle className={`text-lg text-center ${theme.cardTitleGradient} bg-clip-text text-transparent`}>
              Enter Verification Code
            </CardTitle>
            <CardDescription className={`text-center ${theme.mutedText} text-xs`}>
              Enter the 6-digit code sent to your email
            </CardDescription>
          </CardHeader>

          <CardContent className="relative z-10 pb-5">
            <form id="otp-form" onSubmit={handleSubmit} className="space-y-4">
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
                      className={`w-11 h-11 text-lg ${theme.otpSlot}`}
                    />
                    <InputOTPSlot
                      index={1}
                      className={`w-11 h-11 text-lg ${theme.otpSlot}`}
                    />
                    <InputOTPSlot
                      index={2}
                      className={`w-11 h-11 text-lg ${theme.otpSlot}`}
                    />
                    <InputOTPSlot
                      index={3}
                      className={`w-11 h-11 text-lg ${theme.otpSlot}`}
                    />
                    <InputOTPSlot
                      index={4}
                      className={`w-11 h-11 text-lg ${theme.otpSlot}`}
                    />
                    <InputOTPSlot
                      index={5}
                      className={`w-11 h-11 text-lg ${theme.otpSlot}`}
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {/* Timer and Resend */}
              <div className="text-center">
                {!canResend ? (
                  <p className={`${theme.mutedText} text-sm`}>
                    Code expires in{" "}
                    <span className={`font-semibold ${theme.emphasisText}`}>
                      {formatTime(timeLeft)}
                    </span>
                  </p>
                ) : (
                  <div className="space-y-1">
                    <p className={`${theme.mutedText} text-sm`}>
                      Didn't receive the code?
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleResendOTP}
                      disabled={isResending}
                      className={theme.linkBtn}
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
                className={`w-full h-11 ${theme.submitGradient} text-white font-semibold rounded-xl ${theme.submitShadow} transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group`}
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
            <div className="mt-4 text-center">
              <p className={`text-xs ${theme.mutedText}`}>
                Having trouble?{" "}
                <Link
                  to="/support"
                  className={`font-semibold ${theme.helpLink} hover:underline transition-colors`}
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
