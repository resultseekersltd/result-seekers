"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { resetPassword, ExpertApiError } from "@/lib/api/expert-pool";
import { KeyRound, CheckCircle2 } from "lucide-react";

function ResetPasswordFormContent() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(res.message);
    } catch (err) {
      if (err instanceof ExpertApiError) {
        setError(err.message);
      } else {
        setError("Failed to reset password. The link may be invalid or expired.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6 md:p-8 shadow-md">
      {success ? (
        <div className="text-center space-y-4 py-4">
          <div className="inline-flex items-center justify-center size-14 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 mx-auto">
            <CheckCircle2 className="size-8" />
          </div>
          <h2 className="text-h3 font-semibold text-foreground">Password Reset Complete</h2>
          <p className="text-body text-muted-foreground">{success}</p>
          <div className="pt-4">
            <Button href="/expert-pool/login" className="w-full">
              Sign In with New Password
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-input border border-danger/30 bg-danger/10 p-3 text-small text-danger">
              {error}
            </div>
          )}

          <FormField htmlFor="reset-email" label="Email Address" required>
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormField>

          <FormField htmlFor="reset-new-password" label="New Password" required description="At least 8 characters">
            <Input
              id="reset-new-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormField>

          <FormField htmlFor="reset-confirm-password" label="Confirm New Password" required>
            <Input
              id="reset-confirm-password"
              type="password"
              placeholder="••••••••"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
            />
          </FormField>

          <Button type="submit" className="w-full" disabled={loading || !token}>
            {loading ? "Resetting..." : "Set New Password"}
          </Button>
        </form>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Section className="py-12 md:py-20">
      <Container className="max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary mb-4">
            <KeyRound className="size-6" />
          </div>
          <h1 className="text-h2 font-bold tracking-tight text-foreground">
            Set New Password
          </h1>
          <p className="text-body text-muted-foreground mt-2">
            Choose a strong password for your Expert Pool account.
          </p>
        </div>

        <Suspense fallback={<Card className="p-8 h-64 animate-pulse bg-muted" />}>
          <ResetPasswordFormContent />
        </Suspense>
      </Container>
    </Section>
  );
}
