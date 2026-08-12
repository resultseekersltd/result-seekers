"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { login, sendVerification, ExpertApiError } from "@/lib/api/expert-pool";
import { Lock } from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/expert-pool/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailUnverified, setEmailUnverified] = useState(false);

  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setEmailUnverified(false);

    try {
      const res = await login({ email, password });

      if ("mfa_required" in res && res.mfa_required) {
        sessionStorage.setItem("mfa_token", res.mfa_token);
        router.push("/expert-pool/mfa");
        return;
      }

      router.push(redirect);
    } catch (err) {
      if (err instanceof ExpertApiError) {
        setError(err.message);
        if (err.status === 403 && err.message.toLowerCase().includes("verify your email")) {
          setEmailUnverified(true);
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email) return;
    setResendLoading(true);
    setResendMessage(null);
    try {
      const res = await sendVerification(email);
      setResendMessage(res.message);
    } catch (err) {
      if (err instanceof ExpertApiError) setResendMessage(err.message);
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <Card className="p-6 md:p-8 shadow-md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-input border border-danger/30 bg-danger/10 p-3 text-small text-danger">
            {error}
          </div>
        )}

        {resendMessage && (
          <div className="rounded-input border border-primary/30 bg-primary/10 p-3 text-small text-primary">
            {resendMessage}
          </div>
        )}

        <FormField htmlFor="login-email" label="Email Address" required>
          <Input
            id="login-email"
            type="email"
            placeholder="jane.doe@organization.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </FormField>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-small font-medium text-foreground">Password *</span>
            <Link
              href="/expert-pool/forgot-password"
              className="text-small text-primary hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In to Expert Portal"}
        </Button>

        {emailUnverified && (
          <div className="pt-2 text-center">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={handleResend}
              disabled={resendLoading}
            >
              {resendLoading ? "Sending..." : "Resend Verification Email"}
            </Button>
          </div>
        )}

        <div className="text-center text-small text-muted-foreground pt-2">
          New to the Expert Pool?{" "}
          <Link href="/expert-pool/register" className="text-primary font-medium hover:underline">
            Register here
          </Link>
        </div>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Section className="py-12 md:py-20">
      <Container className="max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary mb-4">
            <Lock className="size-6" />
          </div>
          <h1 className="text-h2 font-bold tracking-tight text-foreground">
            Expert Portal Sign In
          </h1>
          <p className="text-body text-muted-foreground mt-2">
            Access your profile, experience, and advisory status.
          </p>
        </div>

        <Suspense fallback={<Card className="p-8 h-64 animate-pulse bg-muted" />}>
          <LoginFormContent />
        </Suspense>
      </Container>
    </Section>
  );
}
