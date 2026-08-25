"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { OTPInput } from "@/components/ui/OTPInput";
import { Badge } from "@/components/ui/Badge";
import {
  getMe,
  changePassword,
  mfaSetup,
  mfaConfirm,
  mfaDisable,
  getRecoveryCodes,
  regenerateRecoveryCodes,
  OrganisationApiError,
} from "@/lib/api/organisation";
import type { OrganisationUser } from "@/types/organisation";
import { Shield, Lock, KeyRound, CheckCircle2, AlertCircle, Loader2, Copy, Check } from "lucide-react";

/**
 * Combined password + MFA management — MFA is mandatory for organisation
 * accounts (approved Phase 1 scope), so this page always shows the setup
 * flow prominently rather than treating it as optional, unlike the split
 * overview/mfa-subpage pattern used for the (optional-MFA) Expert Pool.
 */
export default function OrganisationSecurityPage() {
  const [user, setUser] = useState<OrganisationUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [setupData, setSetupData] = useState<{ secret: string; qr_url: string } | null>(null);
  const [confirmCode, setConfirmCode] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [newRecoveryCodes, setNewRecoveryCodes] = useState<string[] | null>(null);
  const [unusedCodesCount, setUnusedCodesCount] = useState<number | null>(null);
  const [disablePassword, setDisablePassword] = useState("");
  const [disabling, setDisabling] = useState(false);
  const [regenPassword, setRegenPassword] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function loadUser() {
    getMe()
      .then((res) => {
        setUser(res.user);
        if (res.user.mfa_enabled) {
          getRecoveryCodes().then((r) => setUnusedCodesCount(r.unused_recovery_codes));
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(loadUser, []);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setSavingPassword(true);
    setMessage(null);
    setError(null);

    try {
      const res = await changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: passwordConfirmation,
      });
      setMessage(res.message);
      setCurrentPassword("");
      setNewPassword("");
      setPasswordConfirmation("");
    } catch (err) {
      if (err instanceof OrganisationApiError) setError(err.message);
      else setError("Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleStartSetup() {
    setError(null);
    try {
      const res = await mfaSetup();
      setSetupData(res);
    } catch (err) {
      if (err instanceof OrganisationApiError) setError(err.message);
    }
  }

  async function handleConfirmSetup(e: React.FormEvent) {
    e.preventDefault();
    setConfirming(true);
    setError(null);

    try {
      const res = await mfaConfirm(confirmCode);
      setMessage(res.message);
      setNewRecoveryCodes(res.recovery_codes);
      setSetupData(null);
      loadUser();
    } catch (err) {
      if (err instanceof OrganisationApiError) setError(err.message);
      else setError("Invalid code. Please try again.");
    } finally {
      setConfirming(false);
    }
  }

  async function handleDisableMfa(e: React.FormEvent) {
    e.preventDefault();
    setDisabling(true);
    setError(null);

    try {
      const res = await mfaDisable(disablePassword);
      setMessage(res.message);
      setDisablePassword("");
      setNewRecoveryCodes(null);
      loadUser();
    } catch (err) {
      if (err instanceof OrganisationApiError) setError(err.message);
    } finally {
      setDisabling(false);
    }
  }

  async function handleRegenerateCodes(e: React.FormEvent) {
    e.preventDefault();
    setRegenerating(true);
    setError(null);

    try {
      const res = await regenerateRecoveryCodes(regenPassword);
      setMessage(res.message);
      setNewRecoveryCodes(res.recovery_codes);
      setRegenPassword("");
      loadUser();
    } catch (err) {
      if (err instanceof OrganisationApiError) setError(err.message);
    } finally {
      setRegenerating(false);
    }
  }

  function copyRecoveryCodes() {
    if (!newRecoveryCodes) return;
    navigator.clipboard.writeText(newRecoveryCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
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
          Security &amp; Account Protection
        </h1>
        <p className="text-body text-muted-foreground mt-1">
          Multi-factor authentication is required for all organisation accounts.
        </p>
      </div>

      {message && (
        <div className="rounded-card border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
          <CheckCircle2 className="size-5 shrink-0" />
          <span className="text-small font-medium">{message}</span>
        </div>
      )}

      {error && (
        <div className="rounded-card border border-danger/30 bg-danger/10 p-4 text-danger flex items-center gap-3">
          <AlertCircle className="size-5 shrink-0" />
          <span className="text-small font-medium">{error}</span>
        </div>
      )}

      {newRecoveryCodes && (
        <Card className="p-6 md:p-8 border-emerald-500/40 bg-emerald-500/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-h3 font-bold text-foreground flex items-center gap-2">
              <KeyRound className="size-5 text-emerald-600 dark:text-emerald-400" />
              Save Your Recovery Codes
            </h2>
            <Button variant="secondary" size="sm" onClick={copyRecoveryCodes}>
              {copied ? <Check className="size-4 mr-1 text-emerald-600" /> : <Copy className="size-4 mr-1" />}
              {copied ? "Copied!" : "Copy All"}
            </Button>
          </div>
          <p className="text-small text-muted-foreground">
            Store these 8 backup recovery codes in a safe place. Each can be used once if you lose access to
            your authenticator app.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-card bg-muted/70 font-mono text-small font-semibold text-foreground text-center">
            {newRecoveryCodes.map((c) => (
              <div key={c} className="p-2 border border-border rounded bg-background">
                {c}
              </div>
            ))}
          </div>
        </Card>
      )}

      {!user.mfa_enabled ? (
        <Card className="p-6 md:p-8 max-w-2xl space-y-6 border-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-h3 font-bold text-foreground">Set Up Multi-Factor Authentication</h2>
              <p className="text-small text-muted-foreground mt-1">
                Required before you can fully use the Organisation Portal. Link an authenticator app (Google
                Authenticator, 1Password, Authy).
              </p>
            </div>
            <Badge variant="primary">Setup Required</Badge>
          </div>

          {!setupData ? (
            <Button onClick={handleStartSetup}>Generate Secret &amp; QR Code</Button>
          ) : (
            <form onSubmit={handleConfirmSetup} className="space-y-6 pt-2 border-t border-border">
              <div className="space-y-3">
                <span className="text-small font-semibold text-foreground">Step 1: Scan QR Code</span>
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-card border border-border bg-muted/30">
                  <div className="p-2 bg-white rounded shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={setupData.qr_url} alt="MFA QR Code" className="size-44" />
                  </div>
                  <div className="space-y-1 font-mono text-xs text-foreground select-all bg-card p-3 rounded border border-border break-all">
                    <span className="text-muted-foreground font-sans block mb-1">Secret Key:</span>
                    {setupData.secret}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-small font-semibold text-foreground">Step 2: Enter 6-digit Code</span>
                <OTPInput length={6} value={confirmCode} onChange={setConfirmCode} disabled={confirming} />
              </div>

              <Button type="submit" disabled={confirming || confirmCode.length < 6}>
                {confirming ? "Confirming..." : "Confirm & Enable MFA"}
              </Button>
            </form>
          )}
        </Card>
      ) : (
        <div className="space-y-6 max-w-2xl">
          <Card className="p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-h3 font-bold text-foreground">MFA is Active</h2>
              <Badge variant="success">Enabled</Badge>
            </div>
            <p className="text-small text-muted-foreground">
              Unused recovery codes remaining: <span className="font-semibold text-foreground">{unusedCodesCount ?? "..."}</span>
            </p>
          </Card>

          <Card className="p-6 md:p-8 space-y-4">
            <h3 className="text-h4 font-semibold text-foreground">Regenerate Recovery Codes</h3>
            <form onSubmit={handleRegenerateCodes} className="flex gap-3">
              <Input type="password" placeholder="Current Password" value={regenPassword} onChange={(e) => setRegenPassword(e.target.value)} required />
              <Button type="submit" variant="secondary" disabled={regenerating || !regenPassword}>
                {regenerating ? "Regenerating..." : "Regenerate"}
              </Button>
            </form>
          </Card>

          <Card className="p-6 md:p-8 space-y-4 border-danger/30">
            <h3 className="text-h4 font-semibold text-danger">Disable MFA</h3>
            <p className="text-xs text-muted-foreground">
              MFA is required for organisation accounts — disabling only clears the current setup; you must
              re-enable it before your next full session.
            </p>
            <form onSubmit={handleDisableMfa} className="flex gap-3">
              <Input type="password" placeholder="Current Password" value={disablePassword} onChange={(e) => setDisablePassword(e.target.value)} required />
              <Button type="submit" className="bg-danger text-white hover:bg-danger/90" disabled={disabling || !disablePassword}>
                {disabling ? "Disabling..." : "Disable MFA"}
              </Button>
            </form>
          </Card>
        </div>
      )}

      <Card className="p-6 md:p-8 max-w-2xl space-y-5">
        <div>
          <h2 className="text-h3 font-bold text-foreground flex items-center gap-2">
            <Lock className="size-5 text-primary" />
            Change Password
          </h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <FormField htmlFor="sec-current-password" label="Current Password" required>
            <Input id="sec-current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </FormField>
          <FormField htmlFor="sec-new-password" label="New Password" required description="At least 8 characters">
            <Input id="sec-new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </FormField>
          <FormField htmlFor="sec-confirm-password" label="Confirm New Password" required>
            <Input id="sec-confirm-password" type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required />
          </FormField>
          <div className="pt-2">
            <Button type="submit" disabled={savingPassword}>
              {savingPassword ? "Updating password..." : "Update Password"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
