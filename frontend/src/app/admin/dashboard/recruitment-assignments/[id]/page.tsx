"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  addPipelineEntry,
  approveCandidateRelease,
  getRecruitmentAssignment,
  invitePipelineEntry,
  listPipelineEntries,
  qualityReviewPipelineEntry,
  requestPipelineEntryConsent,
  screenPipelineEntry,
  searchRecruiterDatabase,
  updateRecruitmentAssignmentStatus,
  type CandidatePipelineEntry,
  type ExpertSearchResult,
  type RecruitmentAssignment,
} from "@/lib/api/admin";
import Link from "next/link";
import { ChevronLeft, ClipboardCheck, PlusCircle, Search, Send, ShieldCheck, UserCheck } from "lucide-react";

const STATUS_VARIANT: Record<string, "neutral" | "accent" | "success" | "outline"> = {
  opened: "accent",
  completed: "success",
  cancelled: "neutral",
  archived: "neutral",
};

export default function RecruitmentAssignmentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [assignment, setAssignment] = useState<RecruitmentAssignment | null>(null);
  const [entries, setEntries] = useState<CandidatePipelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busyEntryId, setBusyEntryId] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);

  const [searchDiscipline, setSearchDiscipline] = useState("");
  const [searchResults, setSearchResults] = useState<ExpertSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    Promise.all([getRecruitmentAssignment(id), listPipelineEntries(id)])
      .then(([assignmentRes, entriesRes]) => {
        setAssignment(assignmentRes.data);
        setEntries(entriesRes.data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleAssignmentStatus(status: "completed" | "cancelled" | "archived") {
    setSavingStatus(true);
    try {
      const res = await updateRecruitmentAssignmentStatus(id, status);
      setAssignment(res.data);
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleSearch() {
    setSearching(true);
    try {
      const res = await searchRecruiterDatabase({ discipline: searchDiscipline || undefined });
      setSearchResults(res.data);
    } finally {
      setSearching(false);
    }
  }

  async function handleAddCandidate(profileId: number) {
    setBusyEntryId(`add-${profileId}`);
    try {
      const res = await addPipelineEntry(id, profileId);
      setEntries((prev) => [res.data, ...prev]);
    } finally {
      setBusyEntryId(null);
    }
  }

  function replaceEntry(updated: CandidatePipelineEntry) {
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  }

  async function handleScreen(entry: CandidatePipelineEntry, decision: "eligible" | "not_eligible" | "needs_clarification") {
    setBusyEntryId(entry.id);
    try {
      const res = await screenPipelineEntry(id, entry.id, decision);
      replaceEntry(res.data);
    } finally {
      setBusyEntryId(null);
    }
  }

  async function handleQualityReview(entry: CandidatePipelineEntry, decision: "approved" | "rejected" | "changes_requested") {
    setBusyEntryId(entry.id);
    try {
      const res = await qualityReviewPipelineEntry(id, entry.id, decision);
      replaceEntry(res.data);
    } finally {
      setBusyEntryId(null);
    }
  }

  async function handleInvite(entry: CandidatePipelineEntry) {
    setBusyEntryId(entry.id);
    try {
      const res = await invitePipelineEntry(id, entry.id);
      replaceEntry(res.data.entry);
    } finally {
      setBusyEntryId(null);
    }
  }

  async function handleRequestConsent(entry: CandidatePipelineEntry) {
    setBusyEntryId(entry.id);
    try {
      const res = await requestPipelineEntryConsent(id, entry.id);
      replaceEntry(res.data.entry);
    } finally {
      setBusyEntryId(null);
    }
  }

  async function handleApproveRelease(entry: CandidatePipelineEntry) {
    if (!entry.latest_consent) return;
    setBusyEntryId(entry.id);
    try {
      await approveCandidateRelease(entry.latest_consent.id);
      load();
    } finally {
      setBusyEntryId(null);
    }
  }

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (error || !assignment) {
    return <ErrorState description="We couldn't load this recruitment assignment." retry={{ label: "Retry", onRetry: load }} />;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => router.push("/admin/dashboard/recruitment-assignments")}
        className="text-small text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Back to Recruitment Assignments
      </button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h2 text-foreground">{assignment.talent_request_title ?? assignment.reference}</h1>
          <p className="text-small text-muted-foreground mt-1 font-mono">{assignment.reference}</p>
          <p className="text-small text-muted-foreground mt-1">
            {assignment.organisation_name} · Recruiter: {assignment.recruiter_name ?? "—"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={STATUS_VARIANT[assignment.status] ?? "outline"} className="normal-case">
            {assignment.status}
          </Badge>
          {assignment.status === "opened" && (
            <Select
              value=""
              onChange={(e) => e.target.value && handleAssignmentStatus(e.target.value as "completed" | "cancelled" | "archived")}
              disabled={savingStatus}
            >
              <option value="">Change status…</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="archived">Archived</option>
            </Select>
          )}
        </div>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h4 font-semibold text-foreground flex items-center gap-2">
            <Search className="size-4" /> Add Candidate
          </h2>
          <Button size="sm" variant="secondary" onClick={() => setShowSearch(!showSearch)}>
            {showSearch ? "Hide Search" : "Search Professionals"}
          </Button>
        </div>

        {showSearch && (
          <div className="space-y-3">
            <div className="flex gap-3 max-w-lg">
              <Input
                placeholder="Discipline slug…"
                value={searchDiscipline}
                onChange={(e) => setSearchDiscipline(e.target.value)}
              />
              <Button size="sm" onClick={handleSearch} disabled={searching}>
                {searching ? "Searching…" : "Search"}
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-card border border-border p-3">
                    <div>
                      <p className="text-body font-medium text-foreground">{r.professional_title ?? "—"}</p>
                      <p className="text-small text-muted-foreground">
                        {[r.country, r.years_experience ? `${r.years_experience} yrs` : null].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddCandidate(r.id)}
                      disabled={busyEntryId === `add-${r.id}` || entries.some((e) => e.expert_pool_profile_id === r.id)}
                    >
                      <PlusCircle className="size-4 mr-1.5" />
                      {entries.some((e) => e.expert_pool_profile_id === r.id) ? "Added" : "Add to Pipeline"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      <h2 className="text-h4 font-semibold text-foreground mb-3">Candidate Pipeline</h2>

      {entries.length === 0 ? (
        <EmptyState title="No candidates yet" description="Search the professional database above and add a candidate to begin." />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{entry.professional_title ?? "Candidate"}</p>
                  <Badge variant="outline" className="normal-case mt-1">
                    {entry.stage_label}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/dashboard/recruitment-assignments/${id}/candidates/${entry.id}`}
                    className="inline-flex items-center gap-1.5 text-small font-medium text-primary hover:underline"
                  >
                    <ClipboardCheck className="size-4" /> Evaluation
                  </Link>

                  {(entry.stage === "identified" || entry.stage === "screening") && (
                    <>
                      <Button size="sm" disabled={busyEntryId === entry.id} onClick={() => handleScreen(entry, "eligible")}>
                        Mark Eligible
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busyEntryId === entry.id}
                        onClick={() => handleScreen(entry, "not_eligible")}
                      >
                        Not Eligible
                      </Button>
                    </>
                  )}

                  {entry.stage === "longlisted" && (
                    <>
                      <Button size="sm" disabled={busyEntryId === entry.id} onClick={() => handleQualityReview(entry, "approved")}>
                        <ShieldCheck className="size-4 mr-1.5" /> Approve to Shortlist
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busyEntryId === entry.id}
                        onClick={() => handleQualityReview(entry, "rejected")}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {entry.stage === "shortlisted" && (
                    <Button size="sm" disabled={busyEntryId === entry.id} onClick={() => handleInvite(entry)}>
                      <Send className="size-4 mr-1.5" /> Send Invitation
                    </Button>
                  )}

                  {entry.stage === "invited" && (
                    <span className="text-small text-muted-foreground">
                      Invitation {entry.invitation?.status ?? "sent"} — awaiting professional response
                    </span>
                  )}

                  {entry.stage === "interested" && (
                    <Button size="sm" disabled={busyEntryId === entry.id} onClick={() => handleRequestConsent(entry)}>
                      Request Consent
                    </Button>
                  )}

                  {entry.stage === "consent_pending" && (
                    <span className="text-small text-muted-foreground">
                      Consent {entry.latest_consent?.status ?? "requested"} — awaiting professional response
                    </span>
                  )}

                  {entry.stage === "consented" && (
                    <Button size="sm" disabled={busyEntryId === entry.id} onClick={() => handleApproveRelease(entry)}>
                      <UserCheck className="size-4 mr-1.5" /> Approve Release
                    </Button>
                  )}

                  {entry.stage === "released" && <Badge variant="success">Released</Badge>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
