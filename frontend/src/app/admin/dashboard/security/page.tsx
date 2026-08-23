"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { me, changePassword, AdminApiError, type AdminUser } from "@/lib/api/admin";
import { Shield, Lock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export default function AdminSecurityPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    me()
      .then((res) => setUser(res.user))
      .finally(() => setLoading(false));
  }, []);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(res.message);
      setCurrentPassword("");
      setNewPassword("");
      setPasswordConfirmation("");
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Failed to update password.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="border-border border-b pb-4">
        <h1 className="text-h2 text-foreground flex items-center gap-2">
          <Shield className="text-primary size-6" aria-hidden="true" />
          Security & Account Protection
        </h1>
        <p className="text-body text-muted-foreground mt-1">
          Manage your password and mandatory multi-factor authentication.
        </p>
      </div>

      <Card className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-h4 text-foreground">Multi-Factor Authentication</h2>
            <Badge variant={user.mfa_enabled ? "success" : "outline"}>
              {user.mfa_enabled ? "Enabled" : "Setup Required"}
            </Badge>
          </div>
          <p className="text-small text-muted-foreground max-w-xl">
            MFA is mandatory for all admin accounts. Use an authenticator app such as Google Authenticator,
            1Password, or Authy.
          </p>
        </div>
        <Button href="/admin/dashboard/security/mfa" className="shrink-0">
          {user.mfa_enabled ? "Manage MFA & Backup Codes" : "Set Up MFA"}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </Card>

      <Card className="flex max-w-2xl flex-col gap-5">
        <div>
          <h2 className="text-h4 text-foreground flex items-center gap-2">
            <Lock className="text-primary size-5" aria-hidden="true" />
            Change Password
          </h2>
          <p className="text-small text-muted-foreground mt-1">Choose a new strong password for your account.</p>
        </div>

        {success && (
          <div className="rounded-card border-success/30 bg-success/10 text-success flex items-center gap-3 border p-4">
            <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
            <span className="text-small font-medium">{success}</span>
          </div>
        )}

        {error && (
          <div className="rounded-card border-danger/30 bg-danger/10 text-danger flex items-center gap-3 border p-4">
            <AlertCircle className="size-5 shrink-0" aria-hidden="true" />
            <span className="text-small font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
          <FormField htmlFor="admin-current-password" label="Current Password" required>
            <Input
              id="admin-current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </FormField>

          <FormField htmlFor="admin-new-password" label="New Password" required description="At least 12 characters">
            <Input
              id="admin-new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </FormField>

          <FormField htmlFor="admin-confirm-password" label="Confirm New Password" required>
            <Input
              id="admin-confirm-password"
              type="password"
              autoComplete="new-password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
            />
          </FormField>

          <div className="pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Updating password..." : "Update Password"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
