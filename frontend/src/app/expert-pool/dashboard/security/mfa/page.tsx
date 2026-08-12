"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OTPInput } from "@/components/ui/OTPInput";
import { Badge } from "@/components/ui/Badge";
import {
  getMe,
  mfaSetup,
  mfaConfirm,
  mfaDisable,
  getRecoveryCodes,
  regenerateRecoveryCodes,
  ExpertApiError,
} from "@/lib/api/expert-pool";
import type { ExpertUser } from "@/types/expert-pool";
import { Shield, KeyRound, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Copy, Check } from "lucide-react";

export default function MfaManagementPage() {
  const [user, setUser] = useState<ExpertUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Setup state
  const [setupData, setSetupData] = useState<{ secret: string; qr_url: string } | null>(null);
  const [confirmCode, setConfirmCode] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [newRecoveryCodes, setNewRecoveryCodes] = useState<string[] | null>(null);

  // Active MFA state
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

  async function handleStartSetup() {
    setError(null);
    try {
      const res = await mfaSetup();
      setSetupData(res);
    } catch (err) {
      if (err instanceof ExpertApiError) setError(err.message);
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
      if (err instanceof ExpertApiError) {
        setError(err.message);
      } else {
        setError("Invalid code. Please try again.");
      }
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
      if (err instanceof ExpertApiError) setError(err.message);
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
      if (err instanceof ExpertApiError) setError(err.message);
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
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <Link
          href="/expert-pool/dashboard/security"
          className="inline-flex items-center gap-1.5 text-small text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="size-4" /> Back to Security
        </Link>
        <h1 className="text-h2 font-bold tracking-tight text-foreground flex items-center gap-2">
          <Shield className="size-6 text-primary" />
          Two-Factor Authentication Setup
        </h1>
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

      {/* Recovery Codes Display Modal/Card */}
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
            Store these 8 backup recovery codes in a safe place. If you lose your phone or authenticator app, each code can be used once to sign in.
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
        /* MFA Disabled — Setup Flow */
        <Card className="p-6 md:p-8 max-w-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-h3 font-bold text-foreground">Set Up MFA</h2>
              <p className="text-small text-muted-foreground mt-1">
                Link an authenticator app (Google Authenticator, 1Password, Authy).
              </p>
            </div>
            <Badge variant="accent">Disabled</Badge>
          </div>

          {!setupData ? (
            <Button onClick={handleStartSetup}>Generate Secret & QR Code</Button>
          ) : (
            <form onSubmit={handleConfirmSetup} className="space-y-6 pt-2 border-t border-border">
              <div className="space-y-3">
                <span className="text-small font-semibold text-foreground">Step 1: Scan QR Code</span>
                <p className="text-xs text-muted-foreground">
                  Scan this QR code with your authenticator app, or manually enter the secret key below.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-card border border-border bg-muted/30">
                  <div className="p-2 bg-white rounded shadow-sm">
                    {/* eslint-disable-next-javascript-next/no-img-element */}
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
                <p className="text-xs text-muted-foreground">
                  Enter the code generated by your authenticator app to confirm setup.
                </p>
                <OTPInput length={6} value={confirmCode} onChange={setConfirmCode} disabled={confirming} />
              </div>

              <Button type="submit" disabled={confirming || confirmCode.length < 6}>
                {confirming ? "Confirming..." : "Confirm & Enable MFA"}
              </Button>
            </form>
          )}
        </Card>
      ) : (
        /* MFA Enabled — Management Flow */
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

          {/* Regenerate Recovery Codes */}
          <Card className="p-6 md:p-8 space-y-4">
            <h3 className="text-h4 font-semibold text-foreground">Regenerate Recovery Codes</h3>
            <p className="text-xs text-muted-foreground">
              Generating new codes invalidates all existing recovery codes. Enter your password to confirm.
            </p>
            <form onSubmit={handleRegenerateCodes} className="flex gap-3">
              <Input
                type="password"
                placeholder="Current Password"
                value={regenPassword}
                onChange={(e) => setRegenPassword(e.target.value)}
                required
              />
              <Button type="submit" variant="secondary" disabled={regenerating || !regenPassword}>
                {regenerating ? "Regenerating..." : "Regenerate"}
              </Button>
            </form>
          </Card>

          {/* Disable MFA */}
          <Card className="p-6 md:p-8 space-y-4 border-danger/30">
            <h3 className="text-h4 font-semibold text-danger">Disable MFA</h3>
            <p className="text-xs text-muted-foreground">
              Disabling MFA reduces account security. Enter your password to disable.
            </p>
            <form onSubmit={handleDisableMfa} className="flex gap-3">
              <Input
                type="password"
                placeholder="Current Password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                required
              />
              <Button type="submit" className="bg-danger text-white hover:bg-danger/90" disabled={disabling || !disablePassword}>
                {disabling ? "Disabling..." : "Disable MFA"}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
