"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { login, AdminApiError } from "@/lib/api/admin";
import { ShieldCheck } from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await login(email, password);

      if ("mfa_required" in res && res.mfa_required) {
        sessionStorage.setItem("admin_mfa_token", res.mfa_token);
        router.push("/admin/mfa");
        return;
      }

      if ("mfa_setup_required" in res && res.mfa_setup_required) {
        router.push("/admin/dashboard/security/mfa?setup=required");
        return;
      }

      router.push(redirect);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6 shadow-md md:p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-input border-danger/30 bg-danger/10 text-small text-danger border p-3">
            {error}
          </div>
        )}

        <FormField htmlFor="admin-login-email" label="Email Address" required>
          <Input
            id="admin-login-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </FormField>

        <FormField htmlFor="admin-login-password" label="Password" required>
          <Input
            id="admin-login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </FormField>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </Card>
  );
}

export default function AdminLoginPage() {
  return (
    <Section className="py-12 md:py-20">
      <Container className="max-w-md">
        <div className="mb-8 text-center">
          <div className="bg-primary/10 text-primary mb-4 inline-flex size-12 items-center justify-center rounded-full">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </div>
          <h1 className="text-h2 text-foreground font-bold tracking-tight">Admin Sign In</h1>
          <p className="text-body text-muted-foreground mt-2">
            Central Administration Dashboard — staff access only.
          </p>
        </div>

        <Suspense fallback={<Card className="bg-muted h-64 animate-pulse p-8" />}>
          <LoginFormContent />
        </Suspense>
      </Container>
    </Section>
  );
}
