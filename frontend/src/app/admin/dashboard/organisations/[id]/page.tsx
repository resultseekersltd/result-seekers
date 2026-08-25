"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ChevronLeft } from "lucide-react";
import { getOrganisation, updateOrganisationStatus, type AdminOrganisation } from "@/lib/api/admin";

const STATUS_OPTIONS = [
  "pending_verification",
  "clarification_requested",
  "verified",
  "rejected",
  "suspended",
  "restricted",
  "archived",
];

export default function AdminOrganisationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [organisation, setOrganisation] = useState<AdminOrganisation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    getOrganisation(id)
      .then((res) => setOrganisation(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleStatusChange(status: string) {
    setSaving(true);
    try {
      const res = await updateOrganisationStatus(id, status);
      setOrganisation(res.data);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (error || !organisation) {
    return <ErrorState description="We couldn't load this organisation." retry={{ label: "Retry", onRetry: load }} />;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => router.push("/admin/dashboard/organisations")}
        className="text-small text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Back to Organisations
      </button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h2 text-foreground">{organisation.name}</h1>
          <p className="text-small text-muted-foreground mt-1">
            {organisation.sector ?? "—"} · {organisation.country ?? "—"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="normal-case">
            {organisation.status_label}
          </Badge>
          <Select value={organisation.status} onChange={(e) => handleStatusChange(e.target.value)} disabled={saving}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-3">
          <h2 className="text-h4 font-semibold text-foreground">Organisation Details</h2>
          <dl className="text-small space-y-2">
            <div className="flex justify-between"><dt className="text-muted-foreground">Legal Name</dt><dd>{organisation.legal_name ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Type</dt><dd>{organisation.organisation_type ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Registration No.</dt><dd>{organisation.registration_number ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Website</dt><dd>{organisation.website ?? "—"}</dd></div>
          </dl>
        </Card>

        <Card className="p-6 space-y-3">
          <h2 className="text-h4 font-semibold text-foreground">Primary Contact</h2>
          <dl className="text-small space-y-2">
            <div className="flex justify-between"><dt className="text-muted-foreground">Name</dt><dd>{organisation.contact_person_name ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Position</dt><dd>{organisation.contact_person_position ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Phone</dt><dd>{organisation.contact_person_phone ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Team Members</dt><dd>{organisation.users_count ?? 0}</dd></div>
          </dl>
        </Card>

        {organisation.recruitment_needs && (
          <Card className="p-6 md:col-span-2 space-y-2">
            <h2 className="text-h4 font-semibold text-foreground">Recruitment Needs</h2>
            <p className="text-small text-muted-foreground whitespace-pre-wrap">{organisation.recruitment_needs}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
