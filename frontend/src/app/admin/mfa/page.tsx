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
import { mfaVerify, AdminApiError } from "@/lib/api/admin";
import { ShieldCheck, KeyRound } from "lucide-react";

export default function AdminMfaPage() {
  const router = useRouter();

  const [mfaToken] = useState<string | null>(() =>
    typeof window !== "undefined" ? sessionStorage.getItem("admin_mfa_token") : null,
  );
  const [code, setCode] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mfaToken) {
      router.push("/admin/login");
    }
  }, [mfaToken, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!mfaToken) return;

    setLoading(true);
    setError(null);

    try {
      await mfaVerify(code, mfaToken, recoveryMode);
      sessionStorage.removeItem("admin_mfa_token");
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!mfaToken) return null;

  return (
    <Section className="py-12 md:py-20">
      <Container className="max-w-md">
        <div className="mb-8 text-center">
          <div className="bg-primary/10 text-primary mb-4 inline-flex size-12 items-center justify-center rounded-full">
            {recoveryMode ? (
              <KeyRound className="size-6" aria-hidden="true" />
            ) : (
              <ShieldCheck className="size-6" aria-hidden="true" />
            )}
          </div>
          <h1 className="text-h2 text-foreground font-bold tracking-tight">
            {recoveryMode ? "Use Recovery Code" : "Two-Factor Verification"}
          </h1>
          <p className="text-body text-muted-foreground mt-2">
            {recoveryMode
              ? "Enter one of your 8-character backup recovery codes."
              : "Enter the 6-digit code from your authenticator app."}
          </p>
        </div>

        <Card className="p-6 shadow-md md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-input border-danger/30 bg-danger/10 text-small text-danger border p-3">
                {error}
              </div>
            )}

            {recoveryMode ? (
              <FormField htmlFor="admin-recovery-code" label="Recovery Code" required description="e.g. ABCD-1234">
                <Input
                  id="admin-recovery-code"
                  type="text"
                  placeholder="XXXX-XXXX"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                />
              </FormField>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <OTPInput length={6} value={code} onChange={setCode} invalid={Boolean(error)} disabled={loading} />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || !code}>
              {loading ? "Verifying..." : "Verify & Continue"}
            </Button>

            <div className="pt-2 text-center">
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
                  ? "← Back to authenticator app code"
                  : "Lost access to your authenticator app? Use a recovery code"}
              </button>
            </div>
          </form>
        </Card>
      </Container>
    </Section>
  );
}
