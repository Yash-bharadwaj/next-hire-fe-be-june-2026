import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2, User, Eye, EyeOff, Mail, Lock, Loader2,
  ArrowRight, Target, Users, BarChart3,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.firstName.trim()) e.firstName = "Required";
    if (!formData.lastName.trim()) e.lastName = "Required";
    if (!formData.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Invalid email";
    if (!formData.password) e.password = "Required";
    else if (formData.password.length < 8) e.password = "Min. 8 characters";
    if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await signup({
        email: formData.email, password: formData.password, role: "recruiter",
        first_name: formData.firstName, last_name: formData.lastName,
      });
      navigate("/auth/verify-otp", { state: { email: formData.email, message: "Please check your email for the verification code." } });
    } catch { }
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
              <span className="text-green-100 text-xs font-medium">Recruiter / Company</span>
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-3">
              Build your dream<br />team faster.
            </h1>
            <p className="text-green-100/75 text-sm leading-relaxed">
              Post jobs, manage your hiring pipeline, and close placements — all from one platform.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Target,    label: "Post jobs and attract top talent" },
              { icon: Users,     label: "Manage candidates across all stages" },
              { icon: BarChart3, label: "Track placements and commissions" },
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
        <div className="w-full max-w-sm space-y-6">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-emerald-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xs">TNH</span>
            </div>
            <span className="font-semibold text-gray-900">thenexthire</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
            <p className="text-sm text-gray-500">Set up your recruiter profile in seconds</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="firstName" placeholder="John"
                    value={formData.firstName} onChange={(e) => handleChange("firstName", e.target.value)}
                    className={`pl-9 h-10 text-sm border-gray-200 focus:border-green-500 focus:ring-green-500/20 ${errors.firstName ? "border-red-400" : ""}`}
                  />
                </div>
                {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="lastName" placeholder="Doe"
                    value={formData.lastName} onChange={(e) => handleChange("lastName", e.target.value)}
                    className={`pl-9 h-10 text-sm border-gray-200 focus:border-green-500 focus:ring-green-500/20 ${errors.lastName ? "border-red-400" : ""}`}
                  />
                </div>
                {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Work email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email" type="email" placeholder="you@company.com"
                  value={formData.email} onChange={(e) => handleChange("email", e.target.value)}
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
                    value={formData.password} onChange={(e) => handleChange("password", e.target.value)}
                    className={`pl-9 pr-9 h-10 text-sm border-gray-200 focus:border-green-500 focus:ring-green-500/20 ${errors.password ? "border-red-400" : ""}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="Repeat"
                    value={formData.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    className={`pl-9 pr-9 h-10 text-sm border-gray-200 focus:border-green-500 focus:ring-green-500/20 ${errors.confirmPassword ? "border-red-400" : ""}`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>

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
              <Link to="/auth/signup-candidate" className="font-medium text-gray-600 hover:text-green-600 transition-colors">Candidate</Link>
              <span>·</span>
              <Link to="/auth/signup-vendor" className="font-medium text-gray-600 hover:text-green-600 transition-colors">Vendor</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
