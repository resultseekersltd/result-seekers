"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ChevronLeft, Download, FileText } from "lucide-react";
import { getExpert, updateExpertStatus, toggleExpertActive, type AdminExpert } from "@/lib/api/admin";

const STATUS_OPTIONS = ["under_review", "approved", "rejected", "suspended"];

export default function AdminExpertDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);

  const [expert, setExpert] = useState<AdminExpert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    getExpert(id)
      .then((res) => setExpert(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see audit-log/page.tsx's comment
    load();
  }, [load]);

  async function handleStatusChange(status: string) {
    setSaving(true);
    try {
      const res = await updateExpertStatus(id, status);
      setExpert(res.data);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive() {
    if (!expert) return;
    setSaving(true);
    try {
      await toggleExpertActive(id, !expert.is_active);
      load();
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (error || !expert) {
    return <ErrorState description="We couldn't load this expert." retry={{ label: "Retry", onRetry: load }} />;
  }

  const { profile } = expert;

  return (
    <div>
      <button
        type="button"
        onClick={() => router.push("/admin/dashboard/expert-pool")}
        className="text-small text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Back to Expert Pool
      </button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h2 text-foreground">{expert.name}</h1>
          <p className="text-body text-muted-foreground">{expert.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={expert.is_active ? "success" : "neutral"}>
            {expert.is_active ? "Active" : "Suspended"}
          </Badge>
          <Button variant="secondary" size="sm" onClick={handleToggleActive} disabled={saving}>
            {expert.is_active ? "Suspend Account" : "Reactivate Account"}
          </Button>
        </div>
      </div>

      {!profile ? (
        <Card>
          <p className="text-body text-muted-foreground">This expert has not started their profile yet.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-small text-muted-foreground">Profile Status</p>
                <p className="text-h4 text-foreground mt-1 capitalize">
                  {profile.status?.replace(/_/g, " ") ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-small text-muted-foreground">Completion</p>
                <p className="text-h4 text-foreground mt-1">{profile.completion_percentage}%</p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value=""
                  disabled={saving}
                  onChange={(e) => e.target.value && handleStatusChange(e.target.value)}
                >
                  <option value="">Change status…</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </Card>

          <Card>
            <p className="text-h4 text-foreground mb-4">Personal & Professional</p>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Preferred Name" value={profile.preferred_name} />
              <Field label="Phone" value={profile.phone} />
              <Field label="Location" value={[profile.city, profile.state, profile.country].filter(Boolean).join(", ")} />
              <Field label="Title" value={profile.professional_title} />
              <Field label="Organization" value={profile.current_organization} />
              <Field label="Years of Experience" value={profile.years_experience?.toString()} />
              <Field label="Highest Qualification" value={profile.highest_qualification} />
              <Field label="Field of Study" value={profile.field_of_study} />
            </dl>
            {profile.bio && (
              <div className="mt-4">
                <p className="text-small text-muted-foreground">Bio</p>
                <p className="text-body text-foreground mt-1">{profile.bio}</p>
              </div>
            )}
            {profile.disciplines.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.disciplines.map((d) => (
                  <Badge key={d.id} variant="outline" className="normal-case">
                    {d.name}
                  </Badge>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <p className="text-h4 text-foreground mb-4">CV</p>
            {profile.has_cv ? (
              <a
                href={`/api/admin/expert-pool/${id}/cv`}
                className="text-primary inline-flex items-center gap-2 font-semibold hover:underline"
              >
                <FileText className="size-4" aria-hidden="true" />
                {profile.cv_original_name}
                <Download className="size-4" aria-hidden="true" />
              </a>
            ) : (
              <p className="text-body text-muted-foreground">No CV uploaded.</p>
            )}
          </Card>

          {profile.experiences.length > 0 && (
            <Card>
              <p className="text-h4 text-foreground mb-4">Experience</p>
              <ul className="flex flex-col gap-4">
                {profile.experiences.map((exp) => (
                  <li key={exp.id} className="border-border border-b pb-4 last:border-0 last:pb-0">
                    <p className="text-body text-foreground font-semibold">
                      {exp.job_title} · {exp.organization}
                    </p>
                    <p className="text-small text-muted-foreground">
                      {exp.start_date} – {exp.is_current ? "Present" : exp.end_date}
                    </p>
                    {exp.description && <p className="text-body text-foreground mt-1">{exp.description}</p>}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {profile.education.length > 0 && (
            <Card>
              <p className="text-h4 text-foreground mb-4">Education</p>
              <ul className="flex flex-col gap-4">
                {profile.education.map((ed) => (
                  <li key={ed.id} className="border-border border-b pb-4 last:border-0 last:pb-0">
                    <p className="text-body text-foreground font-semibold">
                      {ed.qualification} · {ed.institution}
                    </p>
                    <p className="text-small text-muted-foreground">
                      {ed.start_year} – {ed.end_year ?? "Present"}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-small text-muted-foreground">{label}</dt>
      <dd className="text-body text-foreground">{value || "—"}</dd>
    </div>
  );
}
