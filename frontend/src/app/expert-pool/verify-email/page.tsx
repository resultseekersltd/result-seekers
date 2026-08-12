"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { verifyEmail, sendVerification, ExpertApiError } from "@/lib/api/expert-pool";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("id");
    const hash = searchParams.get("hash");
    const expires = searchParams.get("expires");
    const signature = searchParams.get("signature");

    if (!id || !hash || !expires || !signature) {
      queueMicrotask(() => {
        setError("Invalid verification link. Please check your email or request a new verification link.");
        setLoading(false);
      });
      return;
    }

    let isMounted = true;
    verifyEmail({ id, hash, expires, signature })
      .then((res) => {
        if (isMounted) setSuccess(res.message);
      })
      .catch((err) => {
        if (isMounted) {
          if (err instanceof ExpertApiError) {
            setError(err.message);
          } else {
            setError("Failed to verify email. The link may be invalid or expired.");
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setResendLoading(true);
    setResendMessage(null);

    try {
      const res = await sendVerification(resendEmail);
      setResendMessage(res.message);
    } catch (err) {
      if (err instanceof ExpertApiError) {
        setResendMessage(err.message);
      } else {
        setResendMessage("Failed to resend verification email.");
      }
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <Card className="p-6 md:p-8 shadow-md text-center">
      {loading ? (
        <div className="py-8 space-y-4">
          <Loader2 className="size-10 animate-spin text-primary mx-auto" />
          <h2 className="text-h3 font-semibold text-foreground">Verifying your email...</h2>
          <p className="text-body text-muted-foreground">Please wait while we validate your link.</p>
        </div>
      ) : success ? (
        <div className="py-4 space-y-4">
          <div className="inline-flex items-center justify-center size-14 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 mx-auto">
            <CheckCircle2 className="size-8" />
          </div>
          <h2 className="text-h2 font-bold text-foreground">Email Verified!</h2>
          <p className="text-body text-muted-foreground">{success}</p>
          <div className="pt-4">
            <Button href="/expert-pool/login" className="w-full">
              Proceed to Login
            </Button>
          </div>
        </div>
      ) : (
        <div className="py-4 space-y-6 text-left">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center size-14 rounded-full bg-danger/10 text-danger mx-auto">
              <AlertCircle className="size-8" />
            </div>
            <h2 className="text-h3 font-bold text-foreground">Verification Failed</h2>
            <p className="text-body text-muted-foreground">{error}</p>
          </div>

          <hr className="border-border" />

          <form onSubmit={handleResend} className="space-y-4">
            <h3 className="text-body font-semibold text-foreground">Resend Verification Link</h3>
            {resendMessage && (
              <div className="rounded-input border border-primary/30 bg-primary/10 p-3 text-small text-primary">
                {resendMessage}
              </div>
            )}
            <FormField htmlFor="resend-email" label="Your Email Address" required>
              <Input
                id="resend-email"
                type="email"
                placeholder="expert@example.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                required
              />
            </FormField>
            <Button type="submit" variant="secondary" className="w-full" disabled={resendLoading}>
              {resendLoading ? "Sending..." : "Resend Link"}
            </Button>
          </form>
        </div>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Section className="py-12 md:py-20">
      <Container className="max-w-md">
        <Suspense
          fallback={
            <Card className="p-8 text-center">
              <Loader2 className="size-10 animate-spin text-primary mx-auto" />
            </Card>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </Container>
    </Section>
  );
}
