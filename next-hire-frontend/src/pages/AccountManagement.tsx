import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  ShieldCheck,
  UserCircle2,
  CheckCircle2,
  CalendarClock,
  RefreshCw,
  KeyRound,
  LockKeyhole,
  Loader2,
} from "lucide-react";

const AccountManagement: React.FC = () => {
  const { user, changePassword, loadProfile } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const formatDate = (value?: string | null) => {
    if (!value) return "Not available";
    try {
      return new Date(value).toLocaleString();
    } catch (error) {
      console.error("Failed to format date:", error);
      return value;
    }
  };

  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Not assigned";
  const statusLabel = user?.status
    ? user.status.charAt(0).toUpperCase() + user.status.slice(1)
    : "Unknown";

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadProfile();
      toast.success("Profile refreshed");
    } catch (error: any) {
      toast.error(error.message || "Unable to refresh profile");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setFormError("Both current and new passwords are required.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setFormError("New password must be at least 8 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFormError("New password and confirmation do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      setFormError(error.message || "Failed to update password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Loading account information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-green-600 font-semibold">
            Account Center
          </p>
          <h1 className="text-3xl font-bold text-gray-900">Profile &amp; Security</h1>
          <p className="text-gray-600">
            Review your authentication details and keep your credentials up to date.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="capitalize">
            {statusLabel}
          </Badge>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Refreshing
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh data
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Authentication Details</CardTitle>
            <CardDescription>
              Core identity fields that are tied to your login.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  label: "Email",
                  value: user.email,
                  icon: Mail,
                  helper: "Primary login identifier",
                },
                {
                  label: "Role",
                  value: roleLabel,
                  icon: UserCircle2,
                  helper: "Controls what you can access",
                },
                {
                  label: "Email Verification",
                  value: user.email_verified ? "Verified" : "Pending",
                  icon: CheckCircle2,
                  helper: user.email_verified
                    ? "Email confirmed"
                    : "Verification required",
                },
                {
                  label: "Account Status",
                  value: statusLabel,
                  icon: ShieldCheck,
                  helper: "Reflects the state of your account",
                },
                {
                  label: "Created On",
                  value: formatDate(user.created_at),
                  icon: CalendarClock,
                  helper: "When the account was provisioned",
                },
                {
                  label: "Last Login",
                  value: formatDate(user.last_login_at),
                  icon: LockKeyhole,
                  helper: "Latest successful authentication",
                },
              ].map(({ label, value, icon: Icon, helper }) => (
                <div
                  key={label}
                  className="rounded-xl border border-gray-100 bg-white/60 p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-50 p-2">
                      <Icon className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        {label}
                      </p>
                      <p className="text-base font-semibold text-gray-900">
                        {value || "Not available"}
                      </p>
                      <p className="text-xs text-gray-500">{helper}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Snapshot</CardTitle>
            <CardDescription>Quick view of your protections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-green-100 bg-green-50/70 p-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Email verification</p>
                <p className="text-xs text-gray-600">
                  {user.email_verified
                    ? "Your email is confirmed."
                    : "Please verify to unlock everything."}
                </p>
              </div>
              <Badge className="bg-white text-green-700">
                {user.email_verified ? "Verified" : "Pending"}
              </Badge>
            </div>
            <Separator />
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                Keep your password unique and avoid reusing credentials from other platforms.
              </p>
              <p>
                Need help? Reach out to your admin team to reset access or update roles.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to secure your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="At least 8 characters"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter new password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              {formError && (
                <p className="text-sm text-red-600">{formError}</p>
              )}
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password Tips</CardTitle>
            <CardDescription>Best practices for a stronger account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-3 rounded-lg border border-gray-100 p-3">
              <ShieldCheck className="mt-1 h-4 w-4 text-green-600" />
              <p>Use a unique password that you do not share with other sites.</p>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-gray-100 p-3">
              <LockKeyhole className="mt-1 h-4 w-4 text-green-600" />
              <p>Combine upper and lowercase letters, numbers, and special characters.</p>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-gray-100 p-3">
              <KeyRound className="mt-1 h-4 w-4 text-green-600" />
              <p>Rotate your password regularly or whenever you suspect unusual activity.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountManagement;
