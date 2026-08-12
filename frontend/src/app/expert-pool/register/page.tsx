"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { register, ExpertApiError } from "@/lib/api/expert-pool";
import { CheckCircle2, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrors({});

    try {
      const res = await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(res.message);
    } catch (err) {
      if (err instanceof ExpertApiError) {
        setError(err.message);
        if (err.errors) setErrors(err.errors);
      } else {
        setError("An unexpected error occurred. Please try again.");
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
            <ShieldCheck className="size-6" />
          </div>
          <h1 className="text-h2 font-bold tracking-tight text-foreground">
            Join the Expert Pool
          </h1>
          <p className="text-body text-muted-foreground mt-2">
            Register as an independent domain expert for high-impact advisory & research opportunities.
          </p>
        </div>

        <Card className="p-6 md:p-8 shadow-md">
          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="inline-flex items-center justify-center size-14 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <CheckCircle2 className="size-8" />
              </div>
              <h2 className="text-h3 font-semibold text-foreground">Verify your email</h2>
              <p className="text-body text-muted-foreground">{success}</p>
              <div className="pt-4">
                <Button href="/expert-pool/login" variant="secondary" className="w-full">
                  Go to Login
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

              <FormField htmlFor="register-name" label="Full Name" error={errors.name?.[0]} required>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="Dr. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </FormField>

              <FormField htmlFor="register-email" label="Email Address" error={errors.email?.[0]} required>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="jane.doe@organization.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </FormField>

              <FormField htmlFor="register-password" label="Password" error={errors.password?.[0]} required description="At least 8 characters">
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </FormField>

              <FormField htmlFor="register-confirm-password" label="Confirm Password" error={errors.password_confirmation?.[0]} required>
                <Input
                  id="register-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                />
              </FormField>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registering..." : "Create Expert Account"}
              </Button>

              <div className="text-center text-small text-muted-foreground pt-2">
                Already have an expert account?{" "}
                <Link href="/expert-pool/login" className="text-primary font-medium hover:underline">
                  Log in
                </Link>
              </div>
            </form>
          )}
        </Card>
      </Container>
    </Section>
  );
}
