"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OTPInput } from "@/components/ui/OTPInput";
import { Badge } from "@/components/ui/Badge";
import {
  me,
  mfaSetup,
  mfaConfirm,
  mfaDisable,
  recoveryCodesStatus,
  regenerateRecoveryCodes,
  AdminApiError,
  type AdminUser,
} from "@/lib/api/admin";
import { Shield, KeyRound, CheckCircle2, AlertCircle, ArrowLeft, Copy, Check } from "lucide-react";

export default function AdminMfaManagementPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [setupData, setSetupData] = useState<{ secret: string; qr_url: string } | null>(null);
  const [confirmCode, setConfirmCode] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [newRecoveryCodes, setNewRecoveryCodes] = useState<string[] | null>(null);

  const [unusedCodesCount, setUnusedCodesCount] = useState<number | null>(null);
  const [disablePassword, setDisablePassword] = useState("");
  const [disabling, setDisabling] = useState(false);

  const [regenPassword, setRegenPassword] = useState("");
  const [regenerating, setRegenerating] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  function loadUser() {
    me()
      .then((res) => {
        setUser(res.user);
        if (res.user.mfa_enabled) {
          recoveryCodesStatus().then((r) => setUnusedCodesCount(r.unused_recovery_codes));
        }
      })
      .finally(() => setLoading(false));
  }

  async function handleStartSetup() {
    setError(null);
    try {
      setSetupData(await mfaSetup());
    } catch (err) {
      if (err instanceof AdminApiError) setError(err.message);
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
      setError(err instanceof AdminApiError ? err.message : "Invalid code. Please try again.");
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
      if (err instanceof AdminApiError) setError(err.message);
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
      if (err instanceof AdminApiError) setError(err.message);
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

  if (loading || !user) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="border-border border-b pb-4">
        <Link
          href="/admin/dashboard/security"
          className="text-small text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to Security
        </Link>
        <h1 className="text-h2 text-foreground flex items-center gap-2">
          <Shield className="text-primary size-6" aria-hidden="true" />
          Two-Factor Authentication Setup
        </h1>
      </div>

      {message && (
        <div className="rounded-card border-success/30 bg-success/10 text-success flex items-center gap-3 border p-4">
          <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
          <span className="text-small font-medium">{message}</span>
        </div>
      )}

      {error && (
        <div className="rounded-card border-danger/30 bg-danger/10 text-danger flex items-center gap-3 border p-4">
          <AlertCircle className="size-5 shrink-0" aria-hidden="true" />
          <span className="text-small font-medium">{error}</span>
        </div>
      )}

      {newRecoveryCodes && (
        <Card className="border-success/40 bg-success/5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-h4 text-foreground flex items-center gap-2">
              <KeyRound className="text-success size-5" aria-hidden="true" />
              Save Your Recovery Codes
            </h2>
            <Button variant="secondary" size="sm" onClick={copyRecoveryCodes}>
              {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy All"}
            </Button>
          </div>
          <p className="text-small text-muted-foreground">
            Store these 8 backup recovery codes somewhere safe. Each one can be used once if you lose access to
            your authenticator app.
          </p>
          <div className="rounded-card bg-muted/70 text-small text-foreground grid grid-cols-2 gap-3 p-4 text-center font-mono font-semibold sm:grid-cols-4">
            {newRecoveryCodes.map((c) => (
              <div key={c} className="border-border bg-background rounded border p-2">
                {c}
              </div>
            ))}
          </div>
        </Card>
      )}

      {!user.mfa_enabled ? (
        <Card className="flex max-w-2xl flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-h4 text-foreground">Set Up MFA</h2>
              <p className="text-small text-muted-foreground mt-1">
                Link an authenticator app (Google Authenticator, 1Password, Authy).
              </p>
            </div>
            <Badge variant="outline">Required</Badge>
          </div>

          {!setupData ? (
            <Button onClick={handleStartSetup}>Generate Secret & QR Code</Button>
          ) : (
            <form onSubmit={handleConfirmSetup} className="border-border flex flex-col gap-6 border-t pt-2">
              <div className="flex flex-col gap-3">
                <span className="text-small text-foreground font-semibold">Step 1: Scan QR Code</span>
                <p className="text-caption text-muted-foreground">
                  Scan this QR code with your authenticator app, or enter the secret key manually.
                </p>
                <div className="border-border bg-muted/30 flex flex-col items-center gap-6 rounded-card border p-4 sm:flex-row">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={setupData.qr_url}
                    alt="MFA QR code — scan with your authenticator app"
                    className="size-44 rounded bg-white p-2"
                  />
                  <div className="border-border bg-background text-caption text-foreground rounded border p-3 font-mono break-all select-all">
                    <span className="text-muted-foreground mb-1 block font-sans">Secret Key:</span>
                    {setupData.secret}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-small text-foreground font-semibold">Step 2: Enter 6-digit Code</span>
                <OTPInput length={6} value={confirmCode} onChange={setConfirmCode} disabled={confirming} />
              </div>

              <Button type="submit" disabled={confirming || confirmCode.length < 6}>
                {confirming ? "Confirming..." : "Confirm & Enable MFA"}
              </Button>
            </form>
          )}
        </Card>
      ) : (
        <div className="flex max-w-2xl flex-col gap-6">
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-h4 text-foreground">MFA is Active</h2>
              <Badge variant="success">Enabled</Badge>
            </div>
            <p className="text-small text-muted-foreground">
              Unused recovery codes remaining:{" "}
              <span className="text-foreground font-semibold">{unusedCodesCount ?? "…"}</span>
            </p>
          </Card>

          <Card className="flex flex-col gap-4">
            <h3 className="text-h4 text-foreground">Regenerate Recovery Codes</h3>
            <p className="text-caption text-muted-foreground">
              Generating new codes invalidates all existing ones. Enter your password to confirm.
            </p>
            <form onSubmit={handleRegenerateCodes} className="flex gap-3">
              <Input
                type="password"
                placeholder="Current Password"
                value={regenPassword}
                onChange={(e) => setRegenPassword(e.target.value)}
                required
              />
              <Button type="submit" variant="secondary" disabled={regenerating || !regenPassword} className="shrink-0">
                {regenerating ? "Regenerating..." : "Regenerate"}
              </Button>
            </form>
          </Card>

          <Card className="border-danger/30 flex flex-col gap-4">
            <h3 className="text-h4 text-danger">Disable MFA</h3>
            <p className="text-caption text-muted-foreground">
              MFA is mandatory for admin accounts — disabling it here only clears your current setup; you&apos;ll be
              prompted to set it up again on your next login.
            </p>
            <form onSubmit={handleDisableMfa} className="flex gap-3">
              <Input
                type="password"
                placeholder="Current Password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                required
              />
              <Button type="submit" disabled={disabling || !disablePassword} className="shrink-0">
                {disabling ? "Disabling..." : "Disable MFA"}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
