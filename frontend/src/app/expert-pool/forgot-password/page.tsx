"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { forgotPassword, ExpertApiError } from "@/lib/api/expert-pool";
import { KeyRound, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await forgotPassword(email);
      setSuccess(res.message);
    } catch (err) {
      if (err instanceof ExpertApiError) {
        setError(err.message);
      } else {
        setError("Failed to request password reset. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section className="py-12 md:py-20">
      <Container className="max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary mb-4">
            <KeyRound className="size-6" />
          </div>
          <h1 className="text-h2 font-bold tracking-tight text-foreground">
            Reset your Password
          </h1>
          <p className="text-body text-muted-foreground mt-2">
            Enter your registered expert email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        <Card className="p-6 md:p-8 shadow-md">
          {success ? (
            <div className="space-y-4 text-center py-2">
              <div className="rounded-input border border-emerald-500/30 bg-emerald-500/10 p-4 text-body text-emerald-600 dark:text-emerald-400">
                {success}
              </div>
              <Button href="/expert-pool/login" variant="secondary" className="w-full">
                Return to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-input border border-danger/30 bg-danger/10 p-3 text-small text-danger">
                  {error}
                </div>
              )}

              <FormField htmlFor="forgot-email" label="Email Address" required>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="jane.doe@organization.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </FormField>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending link..." : "Send Reset Link"}
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/expert-pool/login"
                  className="inline-flex items-center gap-1.5 text-small text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-4" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </Card>
      </Container>
    </Section>
  );
}
