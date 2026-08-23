"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { getProfile, updateProfile, OrganisationApiError } from "@/lib/api/organisation";
import type { Organisation } from "@/types/organisation";
import { Building2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function OrganisationProfilePage() {
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProfile()
      .then((res) => setOrganisation(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!organisation) return;
    setSaving(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await updateProfile({
        legal_name: organisation.legal_name ?? undefined,
        trading_name: organisation.trading_name ?? undefined,
        organisation_type: organisation.organisation_type ?? undefined,
        sector: organisation.sector ?? undefined,
        country: organisation.country ?? undefined,
        state: organisation.state ?? undefined,
        website: organisation.website ?? undefined,
        profile_description: organisation.profile_description ?? undefined,
        recruitment_needs: organisation.recruitment_needs ?? undefined,
      });
      setOrganisation(res.data);
      setSuccess("Organisation profile updated.");
    } catch (err) {
      if (err instanceof OrganisationApiError) {
        setError(err.message);
      } else {
        setError("Failed to update profile.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!organisation) return null;

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="size-6 text-primary" />
            Organisation Profile
          </h1>
          <p className="text-body text-muted-foreground mt-1">Keep your organisation details up to date.</p>
        </div>
        <Badge variant="outline">{organisation.status_label}</Badge>
      </div>

      {success && (
        <div className="rounded-card border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
          <CheckCircle2 className="size-5 shrink-0" />
          <span className="text-small font-medium">{success}</span>
        </div>
      )}

      {error && (
        <div className="rounded-card border border-danger/30 bg-danger/10 p-4 text-danger flex items-center gap-3">
          <AlertCircle className="size-5 shrink-0" />
          <span className="text-small font-medium">{error}</span>
        </div>
      )}

      <Card className="p-6 md:p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField htmlFor="legal-name" label="Legal Name">
            <Input
              id="legal-name"
              value={organisation.legal_name ?? ""}
              onChange={(e) => setOrganisation({ ...organisation, legal_name: e.target.value })}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField htmlFor="org-type" label="Organisation Type">
              <Input
                id="org-type"
                value={organisation.organisation_type ?? ""}
                onChange={(e) => setOrganisation({ ...organisation, organisation_type: e.target.value })}
              />
            </FormField>
            <FormField htmlFor="sector" label="Sector">
              <Input
                id="sector"
                value={organisation.sector ?? ""}
                onChange={(e) => setOrganisation({ ...organisation, sector: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField htmlFor="country" label="Country">
              <Input
                id="country"
                value={organisation.country ?? ""}
                onChange={(e) => setOrganisation({ ...organisation, country: e.target.value })}
              />
            </FormField>
            <FormField htmlFor="state" label="State / Region">
              <Input
                id="state"
                value={organisation.state ?? ""}
                onChange={(e) => setOrganisation({ ...organisation, state: e.target.value })}
              />
            </FormField>
          </div>

          <FormField htmlFor="website" label="Website">
            <Input
              id="website"
              value={organisation.website ?? ""}
              onChange={(e) => setOrganisation({ ...organisation, website: e.target.value })}
            />
          </FormField>

          <FormField htmlFor="recruitment-needs" label="Typical Recruitment Needs">
            <textarea
              id="recruitment-needs"
              className="w-full rounded-input border border-border bg-background p-3 text-body"
              rows={3}
              value={organisation.recruitment_needs ?? ""}
              onChange={(e) => setOrganisation({ ...organisation, recruitment_needs: e.target.value })}
            />
          </FormField>

          <div className="pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
