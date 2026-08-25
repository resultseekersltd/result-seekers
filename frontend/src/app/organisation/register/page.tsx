"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { register, OrganisationApiError } from "@/lib/api/organisation";
import { Building2, CheckCircle2 } from "lucide-react";

export default function OrganisationRegisterPage() {
  const [organisationName, setOrganisationName] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPosition, setContactPosition] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);

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
        organisation_name: organisationName,
        country,
        website: website || undefined,
        contact_name: contactName,
        contact_position: contactPosition || undefined,
        terms_agreed: termsAgreed,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(res.message);
    } catch (err) {
      if (err instanceof OrganisationApiError) {
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
      <Container className="max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary mb-4">
            <Building2 className="size-6" />
          </div>
          <h1 className="text-h2 font-bold tracking-tight text-foreground">Register Your Organisation</h1>
          <p className="text-body text-muted-foreground mt-2">
            Request talent, project teams, and managed recruitment support from Result Seekers. Your
            organisation account is reviewed and verified before full access is granted.
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
                <Button href="/organisation/login" variant="secondary" className="w-full">
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

              <FormField htmlFor="org-name" label="Organisation Name" error={errors.organisation_name?.[0]} required>
                <Input
                  id="org-name"
                  type="text"
                  placeholder="Acme Development Partners"
                  value={organisationName}
                  onChange={(e) => setOrganisationName(e.target.value)}
                  required
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField htmlFor="org-country" label="Country" error={errors.country?.[0]}>
                  <Input id="org-country" type="text" placeholder="Nigeria" value={country} onChange={(e) => setCountry(e.target.value)} />
                </FormField>
                <FormField htmlFor="org-website" label="Website" error={errors.website?.[0]}>
                  <Input id="org-website" type="text" placeholder="https://" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </FormField>
              </div>

              <hr className="border-border" />

              <FormField htmlFor="contact-name" label="Your Full Name" error={errors.contact_name?.[0]} required>
                <Input id="contact-name" type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} required />
              </FormField>

              <FormField htmlFor="contact-position" label="Your Position" error={errors.contact_position?.[0]}>
                <Input id="contact-position" type="text" placeholder="HR Director" value={contactPosition} onChange={(e) => setContactPosition(e.target.value)} />
              </FormField>

              <FormField htmlFor="register-email" label="Work Email Address" error={errors.email?.[0]} required>
                <Input id="register-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </FormField>

              <FormField htmlFor="register-password" label="Password" error={errors.password?.[0]} required description="At least 8 characters">
                <Input id="register-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </FormField>

              <FormField htmlFor="register-confirm-password" label="Confirm Password" error={errors.password_confirmation?.[0]} required>
                <Input id="register-confirm-password" type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required />
              </FormField>

              <label className="flex items-start gap-2.5 text-small text-muted-foreground">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="mt-0.5"
                  required
                />
                <span>I agree to the Result Seekers organisation terms and data-use commitments.</span>
              </label>
              {errors.terms_agreed && <p className="text-small text-danger">{errors.terms_agreed[0]}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registering..." : "Create Organisation Account"}
              </Button>

              <div className="text-center text-small text-muted-foreground pt-2">
                Already registered?{" "}
                <Link href="/organisation/login" className="text-primary font-medium hover:underline">
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
