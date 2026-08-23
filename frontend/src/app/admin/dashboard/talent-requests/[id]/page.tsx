"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ChevronLeft, UserPlus, Workflow } from "lucide-react";
import {
  assignRecruiter,
  createRecruitmentAssignment,
  getTalentRequest,
  updateTalentRequestStatus,
  type AdminTalentRequest,
} from "@/lib/api/admin";

// Matches the exact set Api\Admin\TalentRequestController::updateStatus()
// accepts — draft/assigned/in_recruitment are system-set (by submission,
// assign-recruiter, and opening a recruitment assignment respectively),
// not manually chosen from this dropdown.
const STATUS_OPTIONS = ["under_review", "clarification_requested", "assigned", "in_recruitment", "completed", "cancelled"];

export default function AdminTalentRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [request, setRequest] = useState<AdminTalentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recruiterId, setRecruiterId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [openingAssignment, setOpeningAssignment] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    getTalentRequest(id)
      .then((res) => setRequest(res.data))
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
      const res = await updateTalentRequestStatus(id, status);
      setRequest(res.data);
    } finally {
      setSaving(false);
    }
  }

  async function handleAssignRecruiter(e: React.FormEvent) {
    e.preventDefault();
    if (!recruiterId.trim()) return;
    setAssigning(true);
    try {
      const res = await assignRecruiter(id, Number(recruiterId));
      setRequest(res.data);
      setRecruiterId("");
    } finally {
      setAssigning(false);
    }
  }

  async function handleOpenAssignment() {
    setOpeningAssignment(true);
    try {
      const res = await createRecruitmentAssignment(id);
      router.push(`/admin/dashboard/recruitment-assignments/${res.data.id}`);
    } finally {
      setOpeningAssignment(false);
    }
  }

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (error || !request) {
    return <ErrorState description="We couldn't load this talent request." retry={{ label: "Retry", onRetry: load }} />;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => router.push("/admin/dashboard/talent-requests")}
        className="text-small text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Back to Talent Requests
      </button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h2 text-foreground">{request.title}</h1>
          <p className="text-small text-muted-foreground mt-1 font-mono">{request.reference}</p>
          <p className="text-small text-muted-foreground mt-1">{request.organisation_name}</p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="normal-case">
            {request.status.replace(/_/g, " ")}
          </Badge>
          <Select value={request.status} onChange={(e) => handleStatusChange(e.target.value)} disabled={saving}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Card className="p-6 space-y-4 max-w-2xl">
        <div>
          <p className="text-small font-semibold text-muted-foreground uppercase tracking-wide">Description</p>
          <p className="text-body text-foreground mt-1 whitespace-pre-wrap">{request.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-small font-semibold text-muted-foreground uppercase tracking-wide">Service</p>
            <p className="text-body text-foreground mt-1">{request.service_type.replace(/_/g, " ")}</p>
          </div>
          <div>
            <p className="text-small font-semibold text-muted-foreground uppercase tracking-wide">Number Required</p>
            <p className="text-body text-foreground mt-1">{request.number_required}</p>
          </div>
          {request.location && (
            <div>
              <p className="text-small font-semibold text-muted-foreground uppercase tracking-wide">Location</p>
              <p className="text-body text-foreground mt-1">{request.location}</p>
            </div>
          )}
          {request.deadline && (
            <div>
              <p className="text-small font-semibold text-muted-foreground uppercase tracking-wide">Deadline</p>
              <p className="text-body text-foreground mt-1">{request.deadline}</p>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6 space-y-4 max-w-2xl mt-6">
        <h2 className="text-h4 font-semibold text-foreground">Recruiter Assignment</h2>

        {request.assigned_recruiter_name ? (
          <p className="text-body text-foreground">
            Assigned to <span className="font-semibold">{request.assigned_recruiter_name}</span>
          </p>
        ) : (
          <p className="text-small text-muted-foreground">No recruiter assigned yet.</p>
        )}

        <form onSubmit={handleAssignRecruiter} className="flex items-end gap-3">
          <div className="flex-1">
            <label htmlFor="recruiter-id" className="text-small font-semibold text-muted-foreground uppercase tracking-wide">
              Recruiter User ID
            </label>
            <Input
              id="recruiter-id"
              type="number"
              min={1}
              value={recruiterId}
              onChange={(e) => setRecruiterId(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button type="submit" size="sm" disabled={assigning || !recruiterId.trim()}>
            <UserPlus className="size-4 mr-1.5" />
            {request.assigned_recruiter_name ? "Reassign" : "Assign"}
          </Button>
        </form>

        <div className="border-t border-border pt-4">
          <Button size="sm" variant="secondary" onClick={handleOpenAssignment} disabled={openingAssignment}>
            <Workflow className="size-4 mr-1.5" />
            {openingAssignment ? "Opening..." : "Open Recruitment Assignment"}
          </Button>
          <p className="text-caption text-muted-foreground mt-2">
            Opens a Recruitment Assignment against this request and moves it into active recruitment.
          </p>
        </div>
      </Card>
    </div>
  );
}
