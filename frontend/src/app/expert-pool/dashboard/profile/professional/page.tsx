"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { getProfile, updateProfile, ExpertApiError } from "@/lib/api/expert-pool";
import { Briefcase, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ProfessionalDetailsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [professionalTitle, setProfessionalTitle] = useState("");
  const [currentOrganization, setCurrentOrganization] = useState("");
  const [yearsExperience, setYearsExperience] = useState<number | "">("");
  const [highestQualification, setHighestQualification] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    getProfile()
      .then((res) => {
        const p = res.data;
        setProfessionalTitle(p.professional_title || "");
        setCurrentOrganization(p.current_organization || "");
        setYearsExperience(p.years_experience !== null ? p.years_experience : "");
        setHighestQualification(p.highest_qualification || "");
        setFieldOfStudy(p.field_of_study || "");
        setBio(p.bio || "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      await updateProfile({
        professional_title: professionalTitle,
        current_organization: currentOrganization,
        years_experience: yearsExperience === "" ? null : Number(yearsExperience),
        highest_qualification: highestQualification,
        field_of_study: fieldOfStudy,
        bio,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      if (err instanceof ExpertApiError) {
        setError(err.message);
      } else {
        setError("Failed to update professional background.");
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

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-h2 font-bold tracking-tight text-foreground flex items-center gap-2">
          <Briefcase className="size-6 text-primary" />
          Professional Background
        </h1>
        <p className="text-body text-muted-foreground mt-1">
          Provide details regarding your current role, domain credentials, and professional bio.
        </p>
      </div>

      {success && (
        <div className="rounded-card border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
          <CheckCircle2 className="size-5 shrink-0" />
          <span className="text-small font-medium">Professional background saved successfully!</span>
        </div>
      )}

      {error && (
        <div className="rounded-card border border-danger/30 bg-danger/10 p-4 text-danger flex items-center gap-3">
          <AlertCircle className="size-5 shrink-0" />
          <span className="text-small font-medium">{error}</span>
        </div>
      )}

      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField htmlFor="prof-title" label="Professional Title" required description="e.g. Senior Partner / Principal Analyst">
              <Input
                id="prof-title"
                type="text"
                placeholder="Senior Research Fellow"
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
                required
              />
            </FormField>

            <FormField htmlFor="prof-org" label="Current Organization" description="e.g. University / Firm / Independent">
              <Input
                id="prof-org"
                type="text"
                placeholder="Oxford Energy Institute"
                value={currentOrganization}
                onChange={(e) => setCurrentOrganization(e.target.value)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField htmlFor="prof-exp" label="Years of Experience" required>
              <Input
                id="prof-exp"
                type="number"
                min="0"
                max="60"
                placeholder="15"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value === "" ? "" : Number(e.target.value))}
                required
              />
            </FormField>

            <FormField htmlFor="prof-qual" label="Highest Qualification" required description="e.g. PhD, Master of Science">
              <Input
                id="prof-qual"
                type="text"
                placeholder="PhD"
                value={highestQualification}
                onChange={(e) => setHighestQualification(e.target.value)}
                required
              />
            </FormField>

            <FormField htmlFor="prof-field" label="Field of Study">
              <Input
                id="prof-field"
                type="text"
                placeholder="Economics & Public Policy"
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
              />
            </FormField>
          </div>

          <FormField
            htmlFor="prof-bio"
            label="Professional Bio"
            required
            description="Summarize your domain expertise, research publications, and key advisory areas."
          >
            <Textarea
              id="prof-bio"
              rows={6}
              placeholder="Write a concise overview of your advisory track record and domain specializations..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
            />
          </FormField>

          <div className="pt-4">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Professional Background"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
