"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { OTPInput } from "@/components/ui/OTPInput";
import { mfaVerify, ExpertApiError } from "@/lib/api/expert-pool";
import { ShieldCheck, KeyRound } from "lucide-react";

export default function MfaPage() {
  const router = useRouter();

  const [mfaToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("mfa_token");
    }
    return null;
  });
  const [code, setCode] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mfaToken) {
      router.push("/expert-pool/login");
    }
  }, [mfaToken, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!mfaToken) return;

    setLoading(true);
    setError(null);

    try {
      await mfaVerify({
        code,
        recovery_mode: recoveryMode,
        mfa_token: mfaToken,
      });

      sessionStorage.removeItem("mfa_token");
      router.push("/expert-pool/dashboard");
    } catch (err) {
      if (err instanceof ExpertApiError) {
        setError(err.message);
      } else {
        setError("Invalid verification code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!mfaToken) return null;

  return (
    <Section className="py-12 md:py-20">
      <Container className="max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary mb-4">
            {recoveryMode ? <KeyRound className="size-6" /> : <ShieldCheck className="size-6" />}
          </div>
          <h1 className="text-h2 font-bold tracking-tight text-foreground">
            {recoveryMode ? "Use Recovery Code" : "Two-Factor Verification"}
          </h1>
          <p className="text-body text-muted-foreground mt-2">
            {recoveryMode
              ? "Enter one of your 8-character backup recovery codes."
              : "Enter the 6-digit code from your authenticator app."}
          </p>
        </div>

        <Card className="p-6 md:p-8 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-input border border-danger/30 bg-danger/10 p-3 text-small text-danger">
                {error}
              </div>
            )}

            {recoveryMode ? (
              <FormField htmlFor="recovery-code" label="Recovery Code" required description="e.g. ABCD-1234">
                <Input
                  id="recovery-code"
                  type="text"
                  placeholder="XXXX-XXXX"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                />
              </FormField>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <OTPInput
                  length={6}
                  value={code}
                  onChange={setCode}
                  invalid={Boolean(error)}
                  disabled={loading}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || !code}>
              {loading ? "Verifying..." : "Verify & Continue"}
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setRecoveryMode(!recoveryMode);
                  setCode("");
                  setError(null);
                }}
                className="text-small text-primary font-medium hover:underline"
              >
                {recoveryMode
                  ? "← Back to Authenticator App code"
                  : "Lost access to your authenticator app? Use a recovery code"}
              </button>
            </div>
          </form>
        </Card>
      </Container>
    </Section>
  );
}
