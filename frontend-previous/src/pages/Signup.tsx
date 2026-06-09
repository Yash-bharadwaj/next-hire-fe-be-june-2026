import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, User, CreditCard, Shield, Users, BarChart3, FileText, CheckCircle, 
  ChevronLeft, ChevronRight, Upload, Eye, EyeOff, Globe, Phone, Mail, MapPin, 
  Hash, Crown, Zap, Calendar, Lock, FileSignature, Sparkles, TrendingUp, Check
} from "lucide-react";

interface FormData {
  // Step 1: Company & Referral Info
  companyName: string;
  industry: string;
  website: string;
  address: string;
  taxId: string;
  referralCode: string;
  companyLogo: File | null;

  // Step 2: Admin Contact Info
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  adminRole: string;
  password: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;

  // Step 3: Subscription Configuration
  planTier: string;
  addOnModules: string[];
  startWithTrial: boolean;
  trialDuration: number;
  promoCode: string;
  billingCycle: string;

  // Step 4: Team Setup
  adminCount: number;
  opsCount: number;
  viewerCount: number;
  inviteNow: boolean;


  // Step 6: Payment Details
  paymentMethod: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;

  // Step 7: Agreements
  msaAccepted: boolean;
  privacyAccepted: boolean;
  signerName: string;

  // Step 8: Confirmation
  confirmationRead: boolean;
}

interface ValidationErrors {
  [key: string]: boolean;
}

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const [formData, setFormData] = useState<FormData>({
    companyName: "", industry: "", website: "", address: "", taxId: "", referralCode: "", companyLogo: null,
    adminName: "", adminEmail: "", adminPhone: "", adminRole: "", password: "", confirmPassword: "", twoFactorEnabled: false,
    planTier: "", addOnModules: [], startWithTrial: true, trialDuration: 14, promoCode: "", billingCycle: "monthly",
    adminCount: 1, opsCount: 0, viewerCount: 0, inviteNow: false,
    paymentMethod: "credit_card", cardNumber: "", expiryDate: "", cvv: "", cardholderName: "",
    msaAccepted: false, privacyAccepted: false, signerName: "",
    confirmationRead: false,
  });

  const steps = [
    { id: 1, title: "Company Info", icon: Building2 },
    { id: 2, title: "Admin Contact", icon: User },
    { id: 3, title: "Subscription", icon: Crown },
    { id: 4, title: "Team Setup", icon: Users },
    { id: 5, title: "Payment", icon: CreditCard },
    { id: 6, title: "Agreements", icon: FileSignature },
    { id: 7, title: "Confirmation", icon: CheckCircle },
  ];

  const planTiers = [
    { 
      id: "basic", 
      name: "Basic", 
      price: "$29", 
      period: "/month", 
      features: ["Up to 10 users", "Basic reporting", "Email support", "Standard integrations"],
      popular: false,
      icon: Building2
    },
    { 
      id: "pro", 
      name: "Pro", 
      price: "$79", 
      period: "/month", 
      features: ["Up to 50 users", "Advanced reporting", "Priority support", "Advanced integrations", "Custom workflows"],
      popular: true,
      icon: Crown
    },
    { 
      id: "enterprise", 
      name: "Enterprise", 
      price: "Custom", 
      period: "", 
      features: ["Unlimited users", "Custom reporting", "24/7 support", "Full API access", "Dedicated success manager"],
      popular: false,
      icon: Sparkles
    }
  ];

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): { isValid: boolean; errors: ValidationErrors } => {
    const errors: ValidationErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.companyName) errors.companyName = true;
        if (!formData.industry) errors.industry = true;
        if (!formData.website) errors.website = true;
        break;
      case 2:
        if (!formData.adminName) errors.adminName = true;
        if (!formData.adminEmail) errors.adminEmail = true;
        if (!formData.password) errors.password = true;
        if (!formData.confirmPassword) errors.confirmPassword = true;
        if (formData.password !== formData.confirmPassword) {
          errors.password = true;
          errors.confirmPassword = true;
        }
        break;
      case 3:
        if (!formData.planTier) errors.planTier = true;
        break;
      case 4:
        if (formData.adminCount < 1) errors.adminCount = true;
        break;
      case 5:
        if (formData.paymentMethod === "credit_card") {
          if (!formData.cardNumber) errors.cardNumber = true;
          if (!formData.expiryDate) errors.expiryDate = true;
          if (!formData.cvv) errors.cvv = true;
          if (!formData.cardholderName) errors.cardholderName = true;
        }
        break;
      case 6:
        if (!formData.msaAccepted) errors.msaAccepted = true;
        if (!formData.privacyAccepted) errors.privacyAccepted = true;
        if (!formData.signerName) errors.signerName = true;
        break;
      case 7:
        if (!formData.confirmationRead) errors.confirmationRead = true;
        break;
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const nextStep = () => {
    const validation = validateStep(currentStep);
    setValidationErrors(validation.errors);
    
    if (validation.isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 7));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setValidationErrors({}); // Clear errors when going back
  };

  const handleSubmit = async () => {
    const validation = validateStep(7);
    setValidationErrors(validation.errors);
    
    if (!validation.isValid) return;
    
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({ title: "Account Created Successfully!", description: "Welcome to TNH! Your trial has started." });
      navigate("/dashboard");
    } catch (error) {
      toast({ title: "Error", description: "Failed to create account.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    // Step 1: Company & Referral Info
    if (currentStep === 1) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-green-700 font-medium">Company Name *</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                <Input 
                  id="companyName" 
                  placeholder="Enter your company name" 
                  value={formData.companyName} 
                  onChange={(e) => updateFormData('companyName', e.target.value)}
                  className={`pl-10 ${validationErrors.companyName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-primary/20 focus:border-primary/40 focus:ring-primary/40'}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry" className="text-green-700 font-medium">Industry *</Label>
              <Select value={formData.industry} onValueChange={(value) => updateFormData('industry', value)}>
                <SelectTrigger className={validationErrors.industry ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-primary/20 focus:border-primary/40 focus:ring-primary/40'}>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-green-700 font-medium">Website *</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                <Input 
                  id="website" 
                  placeholder="https://yourcompany.com" 
                  value={formData.website} 
                  onChange={(e) => updateFormData('website', e.target.value)}
                  className={`pl-10 ${validationErrors.website ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-primary/20 focus:border-primary/40 focus:ring-primary/40'}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId" className="text-green-700 font-medium">Tax ID</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                <Input 
                  id="taxId" 
                  placeholder="Optional tax identification" 
                  value={formData.taxId} 
                  onChange={(e) => updateFormData('taxId', e.target.value)}
                  className="pl-10 border-green-200 focus:border-green-400 focus:ring-green-400"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address" className="text-green-700 font-medium">Business Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-green-500" />
                <Textarea 
                  id="address" 
                  placeholder="Enter complete business address" 
                  value={formData.address} 
                  onChange={(e) => updateFormData('address', e.target.value)}
                  className="pl-10 min-h-[100px] border-green-200 focus:border-green-400 focus:ring-green-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referralCode" className="text-green-700 font-medium">Referral Code</Label>
              <Input 
                id="referralCode" 
                placeholder="Enter referral or partner code" 
                value={formData.referralCode} 
                onChange={(e) => updateFormData('referralCode', e.target.value)}
                className="border-green-200 focus:border-green-400 focus:ring-green-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyLogo" className="text-green-700 font-medium">Company Logo</Label>
              <div className="card-gradient p-4 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Upload className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <Input 
                      type="file" 
                      id="companyLogo" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          updateFormData('companyLogo', e.target.files[0]);
                        }
                      }}
                      className="border-0 bg-transparent"
                    />
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-2">Upload your company logo (PNG, JPG, SVG)</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Step 2: Admin Contact Info
    if (currentStep === 2) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminName" className="text-primary font-medium">Admin Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
                <Input 
                  id="adminName" 
                  placeholder="Enter admin full name" 
                  value={formData.adminName} 
                  onChange={(e) => updateFormData('adminName', e.target.value)}
                  className={`pl-10 ${validationErrors.adminName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-primary/20 focus:border-primary/40 focus:ring-primary/40'}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminEmail" className="text-primary font-medium">Admin Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
                <Input 
                  type="email" 
                  id="adminEmail" 
                  placeholder="admin@yourcompany.com" 
                  value={formData.adminEmail} 
                  onChange={(e) => updateFormData('adminEmail', e.target.value)}
                  className={`pl-10 ${validationErrors.adminEmail ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-primary/20 focus:border-primary/40 focus:ring-primary/40'}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPhone" className="text-primary font-medium">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
                <Input 
                  id="adminPhone" 
                  placeholder="+1 (555) 123-4567" 
                  value={formData.adminPhone} 
                  onChange={(e) => updateFormData('adminPhone', e.target.value)}
                  className="pl-10 border-primary/20 focus:border-primary/40 focus:ring-primary/40"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminRole" className="text-primary font-medium">Role/Title</Label>
              <Select value={formData.adminRole} onValueChange={(value) => updateFormData('adminRole', value)}>
                <SelectTrigger className="border-primary/20 focus:border-primary/40 focus:ring-primary/40">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin - Full system access and user management</SelectItem>
                  <SelectItem value="recruiter">Recruiter - Talent acquisition and candidate management</SelectItem>
                  <SelectItem value="hiring_manager">Hiring Manager - Interview process and hiring decisions</SelectItem>
                  <SelectItem value="sales_manager">Sales Manager - Sales team oversight and client relationships</SelectItem>
                  <SelectItem value="client">Client - External client access to relevant data</SelectItem>
                  <SelectItem value="vendor">Vendor - Third-party vendor and supplier access</SelectItem>
                  <SelectItem value="employee">Employee - Standard employee access to core features</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-primary font-medium">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Create secure password"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  className={`pl-10 pr-12 ${validationErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-primary/20 focus:border-primary/40 focus:ring-primary/40'}`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Minimum 8 characters with letters and numbers</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-primary font-medium">Confirm Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
                <Input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  className={`pl-10 ${validationErrors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-primary/20 focus:border-primary/40 focus:ring-primary/40'}`}
                />
              </div>
            </div>

            <div className="card-gradient p-4 rounded-lg border border-primary/20">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="twoFactor" 
                  checked={formData.twoFactorEnabled} 
                  onCheckedChange={(checked) => updateFormData('twoFactorEnabled', !!checked)}
                  className="border-primary/30 mt-1"
                />
                <div>
                  <Label htmlFor="twoFactor" className="text-primary font-medium">Enable Two-Factor Authentication</Label>
                  <p className="text-xs text-muted-foreground mt-1">Add an extra layer of security to your account</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Step 3: Subscription Configuration
    if (currentStep === 3) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-green-800 mb-4">Choose Your Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {planTiers.map(tier => (
                <div 
                  key={tier.id} 
                  className={`relative card-gradient p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${
                    formData.planTier === tier.id 
                      ? "border-primary shadow-lg shadow-primary/20" 
                      : validationErrors.planTier 
                        ? "border-red-500 hover:border-red-600"
                        : "border-primary/20 hover:border-primary/40"
                  } ${tier.popular ? "ring-2 ring-primary/50" : ""}`}
                  onClick={() => updateFormData('planTier', tier.id)}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-green-600 text-white px-3 py-1">Most Popular</Badge>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <tier.icon className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <h4 className="text-xl font-bold text-green-800 mb-2">{tier.name}</h4>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-green-700">{tier.price}</span>
                      <span className="text-green-600">{tier.period}</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-green-700">
                          <Check className="w-4 h-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {formData.planTier === tier.id && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="card-gradient p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="startWithTrial" 
                    checked={formData.startWithTrial} 
                    onCheckedChange={(checked) => updateFormData('startWithTrial', !!checked)}
                    className="border-green-300"
                  />
                  <div>
                    <Label htmlFor="startWithTrial" className="text-green-700 font-medium">
                      Start with {formData.trialDuration}-day trial
                    </Label>
                    <p className="text-xs text-green-600">No charges during trial period</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingCycle" className="text-green-700 font-medium">Billing Cycle</Label>
                <Select value={formData.billingCycle} onValueChange={(value) => updateFormData('billingCycle', value)}>
                  <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400">
                    <SelectValue placeholder="Select billing cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly billing</SelectItem>
                    <SelectItem value="yearly">Yearly billing (Save 20%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="promoCode" className="text-green-700 font-medium">Promo Code</Label>
                <div className="flex gap-2">
                  <Input 
                    id="promoCode" 
                    placeholder="Enter promotional code" 
                    value={formData.promoCode} 
                    onChange={(e) => updateFormData('promoCode', e.target.value)}
                    className="border-green-200 focus:border-green-400 focus:ring-green-400"
                  />
                  <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                    Apply
                  </Button>
                </div>
              </div>

              <div className="card-gradient p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-green-700 font-medium">Total</span>
                  <span className="text-xl font-bold text-green-800">
                    {formData.startWithTrial ? "Free Trial" : planTiers.find(t => t.id === formData.planTier)?.price || "$0"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Step 4: Team Setup
    if (currentStep === 4) {
      const totalUsers = formData.adminCount + formData.opsCount + formData.viewerCount;
      
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-gradient p-4 rounded-lg border border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="adminCount" className="text-primary font-medium">Admin Users</Label>
                  <p className="text-xs text-muted-foreground">Full system access</p>
                </div>
              </div>
              <Input 
                type="number" 
                id="adminCount" 
                placeholder="0" 
                value={formData.adminCount.toString()} 
                onChange={(e) => updateFormData('adminCount', parseInt(e.target.value) || 0)}
                className={validationErrors.adminCount ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-primary/20 focus:border-primary/40 focus:ring-primary/40'}
                min="1"
              />
            </div>

            <div className="card-gradient p-4 rounded-lg border border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="opsCount" className="text-primary font-medium">Operations Users</Label>
                  <p className="text-xs text-muted-foreground">Standard operations access</p>
                </div>
              </div>
              <Input 
                type="number" 
                id="opsCount" 
                placeholder="0" 
                value={formData.opsCount.toString()} 
                onChange={(e) => updateFormData('opsCount', parseInt(e.target.value) || 0)}
                className="border-primary/20 focus:border-primary/40 focus:ring-primary/40"
                min="0"
              />
            </div>

            <div className="card-gradient p-4 rounded-lg border border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="viewerCount" className="text-primary font-medium">Viewer Users</Label>
                  <p className="text-xs text-muted-foreground">Read-only access</p>
                </div>
              </div>
              <Input 
                type="number" 
                id="viewerCount" 
                placeholder="0" 
                value={formData.viewerCount.toString()} 
                onChange={(e) => updateFormData('viewerCount', parseInt(e.target.value) || 0)}
                className="border-primary/20 focus:border-primary/40 focus:ring-primary/40"
                min="0"
              />
            </div>
          </div>

          <div className="card-gradient p-6 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-primary">Team Summary</h4>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {totalUsers} Total Users
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{formData.adminCount}</div>
                <div className="text-sm text-muted-foreground">Admins</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{formData.opsCount}</div>
                <div className="text-sm text-muted-foreground">Operations</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{formData.viewerCount}</div>
                <div className="text-sm text-muted-foreground">Viewers</div>
              </div>
            </div>
          </div>

          <div className="card-gradient p-4 rounded-lg border border-primary/20">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="inviteNow" 
                checked={formData.inviteNow} 
                onCheckedChange={(checked) => updateFormData('inviteNow', !!checked)}
                className="border-primary/30 mt-1"
              />
              <div>
                <Label htmlFor="inviteNow" className="text-primary font-medium">Send Invitations Now</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  We'll send invitation emails to your team members after account creation
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Step 5: Payment Details
    if (currentStep === 5) {
      return (
        <div className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="paymentMethod" className="text-primary font-medium text-lg">Payment Method</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className={`card-gradient p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                  formData.paymentMethod === "credit_card" 
                    ? "border-primary shadow-lg shadow-primary/20" 
                    : "border-primary/20 hover:border-primary/40"
                }`}
                onClick={() => updateFormData('paymentMethod', 'credit_card')}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-primary" />
                  <div>
                    <h4 className="font-medium text-primary">Credit Card</h4>
                    <p className="text-xs text-muted-foreground">Secure PCI-compliant processing</p>
                  </div>
                  {formData.paymentMethod === "credit_card" && (
                    <Check className="w-5 h-5 text-primary ml-auto" />
                  )}
                </div>
              </div>

              <div 
                className={`card-gradient p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                  formData.paymentMethod === "ach" 
                    ? "border-primary shadow-lg shadow-primary/20" 
                    : "border-primary/20 hover:border-primary/40"
                }`}
                onClick={() => updateFormData('paymentMethod', 'ach')}
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-primary" />
                  <div>
                    <h4 className="font-medium text-primary">ACH Transfer</h4>
                    <p className="text-xs text-muted-foreground">Direct bank transfer</p>
                  </div>
                  {formData.paymentMethod === "ach" && (
                    <Check className="w-5 h-5 text-primary ml-auto" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {formData.paymentMethod === "credit_card" && (
            <div className="card-gradient p-6 rounded-lg border border-primary/20">
              <h4 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Secure Payment Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="cardNumber" className="text-primary font-medium">Card Number</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
                    <Input 
                      id="cardNumber" 
                      placeholder="1234 5678 9012 3456" 
                      value={formData.cardNumber} 
                      onChange={(e) => updateFormData('cardNumber', e.target.value)}
                      className={`pl-10 ${validationErrors.cardNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-primary/20 focus:border-primary/40 focus:ring-primary/40'}`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate" className="text-primary font-medium">Expiry Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
                    <Input 
                      id="expiryDate" 
                      placeholder="MM/YY" 
                      value={formData.expiryDate} 
                      onChange={(e) => updateFormData('expiryDate', e.target.value)}
                      className={`pl-10 ${validationErrors.expiryDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-primary/20 focus:border-primary/40 focus:ring-primary/40'}`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv" className="text-primary font-medium">CVV</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
                    <Input 
                      id="cvv" 
                      placeholder="123" 
                      value={formData.cvv} 
                      onChange={(e) => updateFormData('cvv', e.target.value)}
                      className={`pl-10 ${validationErrors.cvv ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-primary/20 focus:border-primary/40 focus:ring-primary/40'}`}
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="cardholderName" className="text-primary font-medium">Cardholder Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
                    <Input 
                      id="cardholderName" 
                      placeholder="John Doe" 
                      value={formData.cardholderName} 
                      onChange={(e) => updateFormData('cardholderName', e.target.value)}
                      className={`pl-10 ${validationErrors.cardholderName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-primary/20 focus:border-primary/40 focus:ring-primary/40'}`}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">PCI DSS Compliant</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Your payment information is encrypted and securely processed using industry-standard protocols.
                </p>
              </div>
            </div>
          )}

          {formData.paymentMethod === "ach" && (
            <div className="card-gradient p-6 rounded-lg border border-primary/20">
              <h4 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Bank Account Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-primary font-medium">Bank Name</Label>
                  <Input placeholder="Your Bank Name" className="border-primary/20 focus:border-primary/40 focus:ring-primary/40" />
                </div>

                <div className="space-y-2">
                  <Label className="text-primary font-medium">Account Type</Label>
                  <Select>
                    <SelectTrigger className="border-primary/20 focus:border-primary/40 focus:ring-primary/40">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-primary font-medium">Routing Number</Label>
                  <Input placeholder="123456789" className="border-primary/20 focus:border-primary/40 focus:ring-primary/40" />
                </div>

                <div className="space-y-2">
                  <Label className="text-primary font-medium">Account Number</Label>
                  <Input placeholder="Account number" className="border-primary/20 focus:border-primary/40 focus:ring-primary/40" />
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Secure ACH Processing</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  ACH transfers typically take 3-5 business days to process. Your account will be charged after the trial period.
                </p>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Step 6: Agreements
    if (currentStep === 6) {
      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <FileSignature className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-primary mb-2">Legal Agreements</h3>
            <p className="text-muted-foreground">Please review and accept our terms to continue</p>
          </div>

          <div className="space-y-4">
            <div className="card-gradient rounded-lg border border-primary/20 overflow-hidden">
              <div className="bg-primary/5 p-4 border-b border-primary/10">
                <h4 className="font-semibold text-primary flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Master Service Agreement (MSA) v2.1
                </h4>
                <p className="text-sm text-muted-foreground mt-1">Effective Date: January 1, 2024</p>
              </div>
              
              <div className="p-4 max-h-48 overflow-y-auto text-sm space-y-3">
                <p className="text-muted-foreground">
                  <strong>1. Service Description:</strong> TNH provides cloud-based talent management and human resources solutions including but not limited to applicant tracking, employee onboarding, performance management, and analytics services.
                </p>
                <p className="text-muted-foreground">
                  <strong>2. Data Processing:</strong> We process your data in accordance with applicable data protection laws including GDPR and CCPA. Your data is encrypted in transit and at rest using AES-256 encryption.
                </p>
                <p className="text-muted-foreground">
                  <strong>3. Service Level Agreement:</strong> We guarantee 99.9% uptime with automatic failover and disaster recovery procedures. Support response times: Critical issues within 1 hour, standard issues within 4 hours.
                </p>
                <p className="text-muted-foreground">
                  <strong>4. Limitation of Liability:</strong> Our total liability shall not exceed the fees paid by you in the 12 months preceding the claim. We exclude liability for indirect, consequential, or punitive damages.
                </p>
                <p className="text-muted-foreground">
                  <strong>5. Termination:</strong> Either party may terminate with 30 days written notice. Upon termination, we will provide data export capabilities for 90 days before secure deletion.
                </p>
              </div>
              
              <div className={`p-4 border-t ${validationErrors.msaAccepted ? 'border-red-200 bg-red-50/20' : 'border-primary/10'}`}>
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="msaAccepted" 
                    checked={formData.msaAccepted} 
                    onCheckedChange={(checked) => updateFormData('msaAccepted', !!checked)}
                    className={`mt-1 ${validationErrors.msaAccepted ? 'border-red-500 text-red-500' : 'border-primary/30'}`}
                  />
                  <div>
                    <Label htmlFor="msaAccepted" className="text-primary font-medium cursor-pointer">
                      I have read and accept the Master Service Agreement
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      By checking this box, you agree to be bound by the terms and conditions of the MSA
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-gradient rounded-lg border border-primary/20 overflow-hidden">
              <div className="bg-primary/5 p-4 border-b border-primary/10">
                <h4 className="font-semibold text-primary flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy Policy v1.3
                </h4>
                <p className="text-sm text-muted-foreground mt-1">Last Updated: December 15, 2023</p>
              </div>
              
              <div className="p-4 max-h-48 overflow-y-auto text-sm space-y-3">
                <p className="text-muted-foreground">
                  <strong>1. Information We Collect:</strong> We collect information you provide directly, usage data, device information, and cookies. This includes candidate profiles, employee data, and system analytics.
                </p>
                <p className="text-muted-foreground">
                  <strong>2. How We Use Information:</strong> To provide services, improve our platform, send notifications, ensure security, and comply with legal obligations. We do not sell personal data to third parties.
                </p>
                <p className="text-muted-foreground">
                  <strong>3. Data Sharing:</strong> We share data only with service providers under strict contracts, for legal compliance, or with your explicit consent. All third parties must meet our security standards.
                </p>
                <p className="text-muted-foreground">
                  <strong>4. Your Rights:</strong> You have rights to access, update, delete, or port your data. EU residents have additional GDPR rights including data protection officer contact information.
                </p>
                <p className="text-muted-foreground">
                  <strong>5. Security Measures:</strong> We implement industry-standard security including encryption, access controls, regular audits, and employee training on data protection.
                </p>
              </div>
              
              <div className={`p-4 border-t ${validationErrors.privacyAccepted ? 'border-red-200 bg-red-50/20' : 'border-primary/10'}`}>
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="privacyAccepted" 
                    checked={formData.privacyAccepted} 
                    onCheckedChange={(checked) => updateFormData('privacyAccepted', !!checked)}
                    className={`mt-1 ${validationErrors.privacyAccepted ? 'border-red-500 text-red-500' : 'border-primary/30'}`}
                  />
                  <div>
                    <Label htmlFor="privacyAccepted" className="text-primary font-medium cursor-pointer">
                      I have read and accept the Privacy Policy
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      You acknowledge our data processing practices and your privacy rights
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-gradient p-6 rounded-lg border border-primary/20">
            <h4 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <FileSignature className="w-5 h-5" />
              Electronic Signature
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signerName" className="text-primary font-medium">Legal Name (Electronic Signature)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
                  <Input 
                    id="signerName" 
                    placeholder="Enter your full legal name" 
                    value={formData.signerName} 
                    onChange={(e) => updateFormData('signerName', e.target.value)}
                    className={`pl-10 ${validationErrors.signerName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-primary/20 focus:border-primary/40 focus:ring-primary/40'}`}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  By typing your name, you agree this constitutes your electronic signature with the same legal effect as a handwritten signature.
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-3">
                  <FileSignature className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-medium text-amber-800 mb-1">Electronic Signature Record</h5>
                    <div className="text-xs text-amber-700 space-y-1">
                      <p>• Document Version: MSA v2.1, Privacy Policy v1.3</p>
                      <p>• Timestamp: {new Date().toLocaleString()}</p>
                      <p>• IP Address: Will be recorded upon submission</p>
                      <p>• Signer ID: {formData.adminEmail || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Step 7: Confirmation
    if (currentStep === 7) {
      const selectedPlan = planTiers.find(tier => tier.id === formData.planTier);
      const totalUsers = formData.adminCount + formData.opsCount + formData.viewerCount;
      
      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-primary mb-2">Confirm Your Account Setup</h3>
            <p className="text-muted-foreground">Review your information before creating your account</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-gradient p-6 rounded-lg border border-primary/20">
              <h4 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Company Information
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company:</span>
                  <span className="text-primary font-medium">{formData.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Industry:</span>
                  <span className="text-primary font-medium">{formData.industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Website:</span>
                  <span className="text-primary font-medium">{formData.website}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Admin:</span>
                  <span className="text-primary font-medium">{formData.adminName}</span>
                </div>
              </div>
            </div>

            <div className="card-gradient p-6 rounded-lg border border-primary/20">
              <h4 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Subscription Details
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="text-primary font-medium">{selectedPlan?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="text-primary font-medium">{selectedPlan?.price}{selectedPlan?.period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Billing:</span>
                  <span className="text-primary font-medium">{formData.billingCycle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trial:</span>
                  <span className="text-primary font-medium">
                    {formData.startWithTrial ? `${formData.trialDuration} days` : 'No trial'}
                  </span>
                </div>
              </div>
            </div>

            <div className="card-gradient p-6 rounded-lg border border-primary/20">
              <h4 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Configuration
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Users:</span>
                  <span className="text-primary font-medium">{totalUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Admins:</span>
                  <span className="text-primary font-medium">{formData.adminCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Operations:</span>
                  <span className="text-primary font-medium">{formData.opsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Viewers:</span>
                  <span className="text-primary font-medium">{formData.viewerCount}</span>
                </div>
              </div>
            </div>

          </div>

          <div className="card-gradient p-6 rounded-lg border border-green-200 bg-green-50/50">
            <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Account Activation Timeline
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-700">
                  <strong>Today:</strong> Account created, trial starts immediately
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-700">
                  <strong>Day {formData.trialDuration - 3}:</strong> Trial reminder sent
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-green-700">
                  <strong>Day {formData.trialDuration}:</strong> First billing cycle begins
                </span>
              </div>
            </div>
          </div>

          <div className={`card-gradient p-4 rounded-lg border ${validationErrors.confirmationRead ? 'border-red-500 bg-red-50/20' : 'border-primary/20'}`}>
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="confirmationRead" 
                checked={formData.confirmationRead} 
                onCheckedChange={(checked) => updateFormData('confirmationRead', !!checked)}
                className={`mt-1 ${validationErrors.confirmationRead ? 'border-red-500 text-red-500' : 'border-primary/30'}`}
              />
              <div>
                <Label htmlFor="confirmationRead" className="text-primary font-medium cursor-pointer">
                  I confirm that all information provided is accurate and complete
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  By checking this box, you acknowledge that you have reviewed all the details above and agree to proceed with account creation.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Step {currentStep} Content</h2>
          <p className="text-muted-foreground">Step content would be rendered here</p>
        </div>
        {currentStep === 1 && (
          <div className="space-y-4">
            <Input placeholder="Company Name" value={formData.companyName} onChange={(e) => updateFormData('companyName', e.target.value)} />
            <Select value={formData.industry} onValueChange={(value) => updateFormData('industry', value)}>
              <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Website" value={formData.website} onChange={(e) => updateFormData('website', e.target.value)} />
          </div>
        )}
        {/* Additional step content would be implemented here */}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50/50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Create Your TNH Account</h1>
          <p className="text-green-600 text-lg">Transform your business with our powerful platform</p>
        </div>

        {/* Progress Stepper */}
        <div className="card-gradient rounded-2xl p-6 mb-6 border border-green-200/50">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentStep >= step.id 
                      ? "button-gradient text-white shadow-lg scale-110" 
                      : currentStep === step.id - 1
                      ? "bg-green-100 text-green-600 border-2 border-green-300"
                      : "bg-green-50 text-green-400 border border-green-200"
                  }`}>
                    {currentStep > step.id ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className={`text-sm mt-2 font-medium transition-colors ${
                    currentStep >= step.id ? "text-green-700" : "text-green-500"
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${
                    currentStep > step.id ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-green-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="card-gradient border-green-200/50 shadow-2xl shadow-green-500/10">
          <CardHeader className="text-center pb-6 bg-gradient-to-r from-green-50/50 to-green-100/30 rounded-t-xl border-b border-green-200/30">
            <CardTitle className="text-2xl font-bold text-green-800 flex items-center justify-center gap-3">
              {React.createElement(steps[currentStep - 1].icon, { className: "w-8 h-8 text-green-600" })}
              {steps[currentStep - 1].title}
            </CardTitle>
            <p className="text-green-600 mt-2">Complete step {currentStep} of {steps.length}</p>
          </CardHeader>

          <CardContent className="p-8">
            <div className="min-h-[500px] flex flex-col justify-center">
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-green-200/50">
              <Button 
                variant="outline" 
                onClick={prevStep} 
                disabled={currentStep === 1}
                className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full">
                <div className="flex gap-1">
                  {Array.from({ length: steps.length }, (_, i) => (
                    <div 
                      key={i} 
                      className={`w-2 h-2 rounded-full transition-all ${
                        i + 1 <= currentStep ? "bg-green-500" : "bg-green-200"
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-green-700 font-medium ml-2">
                  {currentStep} / {steps.length}
                </span>
              </div>

              {currentStep < 8 ? (
                <Button 
                  onClick={nextStep}
                  className="button-gradient flex items-center gap-2 shadow-lg hover:shadow-green-500/20"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="button-gradient flex items-center gap-2 shadow-lg hover:shadow-green-500/20"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-green-600">
            Already have an account?{" "}
            <Link to="/auth/login" className="font-medium text-green-700 hover:text-green-800 underline decoration-green-300 hover:decoration-green-500 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
