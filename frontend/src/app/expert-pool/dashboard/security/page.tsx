"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { getMe, changePassword, ExpertApiError } from "@/lib/api/expert-pool";
import type { ExpertUser } from "@/types/expert-pool";
import { Shield, Lock, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";

export default function SecurityOverviewPage() {
  const [user, setUser] = useState<ExpertUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMe()
      .then((res) => setUser(res.user))
      .catch((err) => setError(err.message))
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
      if (err instanceof ExpertApiError) {
        setError(err.message);
      } else {
        setError("Failed to update password.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-4">
        <h1 className="text-h2 font-bold tracking-tight text-foreground flex items-center gap-2">
          <Shield className="size-6 text-primary" />
          Security & Account Protection
        </h1>
        <p className="text-body text-muted-foreground mt-1">
          Manage your account password and multi-factor authentication (MFA).
        </p>
      </div>

      {/* MFA Card */}
      <Card className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-h3 font-bold text-foreground">Multi-Factor Authentication (MFA)</h2>
            <Badge variant={user.mfa_enabled ? "success" : "accent"}>
              {user.mfa_enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <p className="text-small text-muted-foreground max-w-xl">
            Protect your account with Time-based One-Time Passwords (TOTP) using authenticator apps like Google Authenticator or 1Password.
          </p>
        </div>

        <Button href="/expert-pool/dashboard/security/mfa" className="shrink-0">
          {user.mfa_enabled ? "Manage MFA & Backup Codes" : "Set Up MFA"}
          <ArrowRight className="size-4 ml-2" />
        </Button>
      </Card>

      {/* Change Password Card */}
      <Card className="p-6 md:p-8 max-w-2xl space-y-5">
        <div>
          <h2 className="text-h3 font-bold text-foreground flex items-center gap-2">
            <Lock className="size-5 text-primary" />
            Change Password
          </h2>
          <p className="text-small text-muted-foreground mt-1">
            Choose a new strong password for your account.
          </p>
        </div>

        {success && (
          <div className="rounded-card border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
            <CheckCircle2 className="size-5 shrink-0" />
            <span className="text-small font-medium">{success}</span>
          </div>
        )}

        {error && (
          <div className="rounded-card border border-danger/30 bg-danger/10 p-4 text-danger flex items-center gap-3">
            <AlertCircle className="size-5 shrink-0" />
            <span className="text-small font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <FormField htmlFor="sec-current-password" label="Current Password" required>
            <Input
              id="sec-current-password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </FormField>

          <FormField htmlFor="sec-new-password" label="New Password" required description="At least 8 characters">
            <Input
              id="sec-new-password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </FormField>

          <FormField htmlFor="sec-confirm-password" label="Confirm New Password" required>
            <Input
              id="sec-confirm-password"
              type="password"
              placeholder="••••••••"
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
