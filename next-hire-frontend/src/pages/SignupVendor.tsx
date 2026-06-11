import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2, User, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight,
  Handshake, Send, TrendingUp,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function SignupVendor() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { toast } = useToast();

  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    document.title = "Vendor Sign Up | TNH";
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!companyName.trim()) e.companyName = "Required";
    if (!contactName.trim()) e.contactName = "Required";
    if (!email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Required";
    else if (password.length < 8) e.password = "Min. 8 characters";
    if (password !== confirmPassword) e.confirmPassword = "Doesn't match";
    if (!accepted) e.terms = "You must accept the terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      if (!accepted) {
        toast({ title: "Please accept terms", description: "You must accept the terms to continue.", variant: "destructive" });
      }
      return;
    }
    const [firstName, lastName] = contactName.trim().split(" ", 2);
    setIsLoading(true);
    try {
      await signup({ email, password, role: "vendor", first_name: firstName, last_name: lastName || "", company_name: companyName, contact_name: contactName });
      navigate("/auth/verify-otp", { state: { email, message: "Please check your email for the verification code to complete your registration." } });
    } catch { }
    finally { setIsLoading(false); }
  };

  return (
    <div className="h-screen flex overflow-hidden">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[42%] bg-gradient-to-br from-green-700 via-green-600 to-emerald-600 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 64 64%27 width=%2764%27 height=%2764%27 fill=%27none%27 stroke=%27rgb(255 255 255 / 0.05)%27%3e%3ccircle cx=%2732%27 cy=%2732%27 r=%2730%27/%3e%3c/svg%3e')]" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border border-white/30">
            <span className="text-white font-bold text-sm">TNH</span>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">thenexthire</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1 mb-4">
              <Building2 className="w-3.5 h-3.5 text-green-100" />
              <span className="text-green-100 text-xs font-medium">Staffing Vendor</span>
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-3">
              Grow your<br />staffing business.
            </h1>
            <p className="text-green-100/75 text-sm leading-relaxed">
              Access exclusive job listings, submit your candidates, and track placements in real time.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Handshake,  label: "Access vendor-eligible job listings" },
              { icon: Send,       label: "Submit candidates with one click" },
              { icon: TrendingUp, label: "Track placements and earn commissions" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-green-50/90 text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-green-200/50 text-xs">© 2026 The Next Hire.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 overflow-y-auto py-8">
        <div className="w-full max-w-sm space-y-5">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-emerald-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xs">TNH</span>
            </div>
            <span className="font-semibold text-gray-900">thenexthire</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">Create vendor account</h2>
            <p className="text-sm text-gray-500">Set up your staffing agency profile</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">Company name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="companyName" placeholder="Acme Staffing"
                    value={companyName} onChange={(e) => { setCompanyName(e.target.value); if (errors.companyName) setErrors(p => ({...p, companyName: ""})); }}
                    className={`pl-9 h-10 text-sm border-gray-200 focus:border-green-500 focus:ring-green-500/20 ${errors.companyName ? "border-red-400" : ""}`}
                  />
                </div>
                {errors.companyName && <p className="text-xs text-red-500">{errors.companyName}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contactName" className="text-sm font-medium text-gray-700">Your name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="contactName" placeholder="Jane Smith"
                    value={contactName} onChange={(e) => { setContactName(e.target.value); if (errors.contactName) setErrors(p => ({...p, contactName: ""})); }}
                    className={`pl-9 h-10 text-sm border-gray-200 focus:border-green-500 focus:ring-green-500/20 ${errors.contactName ? "border-red-400" : ""}`}
                  />
                </div>
                {errors.contactName && <p className="text-xs text-red-500">{errors.contactName}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Work email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email" type="email" placeholder="you@company.com"
                  value={email} onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(p => ({...p, email: ""})); }}
                  className={`pl-9 h-10 text-sm border-gray-200 focus:border-green-500 focus:ring-green-500/20 ${errors.email ? "border-red-400" : ""}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password" type={showPassword ? "text" : "password"} placeholder="Min. 8 chars"
                    value={password} onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(p => ({...p, password: ""})); }}
                    className={`pl-9 pr-9 h-10 text-sm border-gray-200 focus:border-green-500 focus:ring-green-500/20 ${errors.password ? "border-red-400" : ""}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm" className="text-sm font-medium text-gray-700">Confirm</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirm" type={showConfirm ? "text" : "password"} placeholder="Repeat"
                    value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors(p => ({...p, confirmPassword: ""})); }}
                    className={`pl-9 pr-9 h-10 text-sm border-gray-200 focus:border-green-500 focus:ring-green-500/20 ${errors.confirmPassword ? "border-red-400" : ""}`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox" checked={accepted}
                onChange={(e) => { setAccepted(e.target.checked); if (errors.terms) setErrors(p => ({...p, terms: ""})); }}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
              />
              <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                I agree to the <span className="text-green-600 font-medium">Terms</span> and <span className="text-green-600 font-medium">Privacy Policy</span>
              </span>
            </label>
            {errors.terms && <p className="text-xs text-red-500 -mt-1">{errors.terms}</p>}

            <Button type="submit" disabled={isLoading}
              className="w-full h-10 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 group transition-all">
              {isLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
                : <>Create account <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">Already have an account?</span></div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link to="/auth/login" className="font-medium text-green-600 hover:text-green-700 transition-colors">Sign in</Link>
            <div className="flex items-center gap-3 text-gray-400 text-xs">
              <span>Sign up as</span>
              <Link to="/auth/signup" className="font-medium text-gray-600 hover:text-green-600 transition-colors">Company</Link>
              <span>·</span>
              <Link to="/auth/signup-candidate" className="font-medium text-gray-600 hover:text-green-600 transition-colors">Candidate</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
