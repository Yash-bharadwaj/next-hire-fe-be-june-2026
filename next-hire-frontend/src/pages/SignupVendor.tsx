import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Building2, User, Mail, Lock } from "lucide-react";

export default function SignupVendor() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { toast } = useToast();

  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    document.title = "Vendor Sign Up | TNH";
    const meta = document.querySelector('meta[name="description"]');
    if (meta)
      meta.setAttribute(
        "content",
        "Create your vendor account on TNH to collaborate with clients and submit candidates."
      );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) {
      toast({
        title: "Please accept terms",
        description: "You must accept the terms to continue.",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please confirm your password.",
        variant: "destructive",
      });
      return;
    }

    if (!contactName) {
      toast({
        title: "Contact name required",
        description: "Please enter the contact person's name.",
        variant: "destructive",
      });
      return;
    }

    const [firstName, lastName] = contactName.split(" ", 2);

    setIsLoading(true);
    try {
      await signup({
        email,
        password,
        role: "vendor",
        first_name: firstName,
        last_name: lastName || "",
        company_name: companyName,
        contact_name: contactName,
      });

      // Navigate to OTP verification
      navigate("/auth/verify-otp", {
        state: {
          email,
          message:
            "Please check your email for the verification code to complete your registration.",
        },
      });
    } catch (err) {
      // Error is already shown via toast in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-green-100/50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27 width=%2732%27 height=%2732%27 fill=%27none%27 stroke=%27rgb(34 197 94 / 0.03)%27%3e%3cpath d=%27m0 .5 32 32M32 .5 0 32%27/%3e%3c/svg%3e')] bg-top"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-green-200/20 to-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-emerald-200/15 to-green-300/15 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-green-500/25 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
            <Sparkles className="text-white w-8 h-8 relative z-10" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Create your Vendor account
          </h1>
          <p className="text-green-600/70 font-medium">
            Collaborate with clients and manage submissions
          </p>
        </div>

        <Card className="border-0 shadow-2xl shadow-green-500/10 bg-white/95 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-white/80 to-emerald-50/30"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600"></div>

          <CardHeader className="space-y-1 pb-6 relative z-10">
            <CardTitle className="text-2xl text-center bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
              Sign Up (Vendor)
            </CardTitle>
            <CardDescription className="text-center text-green-600/70">
              Start collaborating with your clients
            </CardDescription>
          </CardHeader>

          <CardContent className="relative z-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="company" className="text-green-700 font-medium">
                  Company name
                </Label>
                <div className="relative group">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
                  <Input
                    id="company"
                    placeholder="Acme Staffing"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="pl-11 h-12 border-green-200/50 focus:border-green-400 focus:ring-green-400/20 bg-white/70"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-green-700 font-medium">
                  Contact name
                </Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
                  <Input
                    id="name"
                    placeholder="Jane Recruiter"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="pl-11 h-12 border-green-200/50 focus:border-green-400 focus:ring-green-400/20 bg-white/70"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-green-700 font-medium">
                  Email
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@acme.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 border-green-200/50 focus:border-green-400 focus:ring-green-400/20 bg-white/70"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-green-700 font-medium"
                >
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 h-12 border-green-200/50 focus:border-green-400 focus:ring-green-400/20 bg-white/70"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-green-700 font-medium">
                  Confirm password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-11 h-12 border-green-200/50 focus:border-green-400 focus:ring-green-400/20 bg-white/70"
                    required
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm text-green-700">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500 focus:ring-2"
                />
                I agree to the Terms and Privacy Policy
              </label>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 hover:from-green-700 hover:via-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 transition-all duration-300"
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-green-700">
              Already have an account?{" "}
              <Link to="/auth/login" className="font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-green-700">
          Are you a Candidate?{" "}
          <Link
            to="/auth/signup-candidate"
            className="font-semibold hover:underline"
          >
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
}
