"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  addInterviewPanelMember,
  assessmentFileDownloadUrl,
  cancelPlacement,
  createAssessment,
  createInterview,
  createPlacement,
  createReferenceCheck,
  createVerificationCase,
  getPlacement,
  listAssessments,
  listAssignmentFeedback,
  listInterviews,
  listPipelineEntries,
  listReferenceChecks,
  scoreAssessmentSubmission,
  submitInterviewScorecard,
  updateInterviewStatus,
  updateReferenceCheck,
  type AdminAssessment,
  type AdminAssignmentFeedback,
  type AdminInterview,
  type AdminPlacement,
  type AdminReferenceCheck,
  type CandidatePipelineEntry,
} from "@/lib/api/admin";
import { ChevronLeft, ClipboardCheck, Plus, ShieldCheck, Briefcase, Users } from "lucide-react";

export default function CandidateEvaluationWorkspacePage() {
  const params = useParams<{ id: string; entryId: string }>();
  const router = useRouter();
  const { id: assignmentId, entryId } = params;

  const [entry, setEntry] = useState<CandidatePipelineEntry | null>(null);
  const [assessments, setAssessments] = useState<AdminAssessment[]>([]);
  const [interviews, setInterviews] = useState<AdminInterview[]>([]);
  const [referenceChecks, setReferenceChecks] = useState<AdminReferenceCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    Promise.all([
      listPipelineEntries(assignmentId),
      listAssessments(assignmentId, entryId),
      listInterviews(assignmentId, entryId),
      listReferenceChecks(assignmentId, entryId),
    ])
      .then(([entriesRes, assessmentsRes, interviewsRes, referenceChecksRes]) => {
        setEntry(entriesRes.data.find((e) => e.id === entryId) ?? null);
        setAssessments(assessmentsRes.data);
        setInterviews(interviewsRes.data);
        setReferenceChecks(referenceChecksRes.data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [assignmentId, entryId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (error || !entry) {
    return <ErrorState description="We couldn't load this candidate's evaluation workspace." retry={{ label: "Retry", onRetry: load }} />;
  }

  return (
    <div className="space-y-8">
      <button
        type="button"
        onClick={() => router.push(`/admin/dashboard/recruitment-assignments/${assignmentId}`)}
        className="text-small text-muted-foreground hover:text-foreground flex items-center gap-1"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Back to Recruitment Assignment
      </button>

      <div>
        <h1 className="text-h2 text-foreground">{entry.professional_title ?? "Candidate"}</h1>
        <Badge variant="outline" className="normal-case mt-1">
          {entry.stage_label}
        </Badge>
      </div>

      <VerificationSection profileId={entry.expert_pool_profile_id} entryId={entryId} />
      <AssessmentsSection assignmentId={assignmentId} entryId={entryId} assessments={assessments} onChange={load} />
      <InterviewsSection assignmentId={assignmentId} entryId={entryId} interviews={interviews} onChange={load} />
      <ReferenceChecksSection assignmentId={assignmentId} entryId={entryId} referenceChecks={referenceChecks} onChange={load} />
      <PlacementSection assignmentId={assignmentId} entryId={entryId} />
    </div>
  );
}

function VerificationSection({ profileId, entryId }: { profileId: number; entryId: string }) {
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  async function handleOpenCase() {
    setCreating(true);
    try {
      await createVerificationCase({ expert_pool_profile_id: profileId, candidate_pipeline_entry_id: entryId });
      setCreated(true);
    } finally {
      setCreating(false);
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-h4 font-semibold text-foreground flex items-center gap-2">
          <ShieldCheck className="size-5" /> Verification
        </h2>
        {!created && (
          <Button size="sm" variant="secondary" disabled={creating} onClick={handleOpenCase}>
            Open Verification Case
          </Button>
        )}
      </div>
      <p className="text-small text-muted-foreground mt-2">
        {created
          ? "A verification case was opened. Manage checks from the Verification Cases page."
          : "Open a case here, then add and review individual checks from the Verification Cases page."}
      </p>
    </Card>
  );
}

function AssessmentsSection({
  assignmentId,
  entryId,
  assessments,
  onChange,
}: {
  assignmentId: string;
  entryId: string;
  assessments: AdminAssessment[];
  onChange: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("written_response");
  const [instructions, setInstructions] = useState("");
  const [creating, setCreating] = useState(false);
  const [scoreDrafts, setScoreDrafts] = useState<Record<string, { score: string; maxScore: string; notes: string }>>({});
  const [scoringId, setScoringId] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await createAssessment(assignmentId, entryId, { type, title, instructions: instructions || undefined });
      setTitle("");
      setInstructions("");
      setShowForm(false);
      onChange();
    } finally {
      setCreating(false);
    }
  }

  async function handleScore(assessment: AdminAssessment, submissionId: string) {
    const draft = scoreDrafts[submissionId];
    if (!draft?.score || !draft?.maxScore) return;
    setScoringId(submissionId);
    try {
      await scoreAssessmentSubmission(assignmentId, entryId, assessment.id, submissionId, {
        score: Number(draft.score),
        max_score: Number(draft.maxScore),
        review_notes: draft.notes || undefined,
      });
      onChange();
    } finally {
      setScoringId(null);
    }
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-h4 font-semibold text-foreground flex items-center gap-2">
          <ClipboardCheck className="size-5" /> Assessments
        </h2>
        <Button size="sm" variant="secondary" onClick={() => setShowForm(!showForm)}>
          <Plus className="size-4 mr-1.5" /> New Assessment
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="space-y-3 border-b border-border pb-4">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="written_response">Written Response</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="file_submission">File Submission</option>
              <option value="technical_assignment">Technical Assignment</option>
              <option value="practical">Practical</option>
              <option value="language">Language</option>
              <option value="custom">Custom</option>
            </Select>
          </div>
          <Textarea placeholder="Instructions" rows={3} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
          <Button type="submit" size="sm" disabled={creating || !title.trim()}>
            Assign Assessment
          </Button>
        </form>
      )}

      {assessments.length === 0 ? (
        <p className="text-small text-muted-foreground">No assessments assigned yet.</p>
      ) : (
        <div className="space-y-3">
          {assessments.map((assessment) => (
            <div key={assessment.id} className="rounded-card border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground">{assessment.title}</p>
                <Badge variant="outline" className="normal-case">
                  {assessment.status_label}
                </Badge>
              </div>
              {assessment.submissions.map((submission) => (
                <div key={submission.id} className="mt-3 rounded-card bg-muted/30 p-3">
                  <p className="text-caption font-semibold text-muted-foreground uppercase tracking-wide">
                    Attempt {submission.attempt_number}
                  </p>
                  <p className="text-small text-foreground mt-1 whitespace-pre-wrap">{submission.response_text}</p>
                  {submission.has_file && (
                    <a
                      href={assessmentFileDownloadUrl(assignmentId, entryId, assessment.id, submission.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-small text-primary underline mt-1 inline-block"
                    >
                      Download file{submission.file_original_name ? `: ${submission.file_original_name}` : ""}
                    </a>
                  )}
                  {submission.score ? (
                    <p className="text-small font-semibold text-success mt-2">
                      Score: {submission.score.score} / {submission.score.max_score}
                    </p>
                  ) : (
                    <div className="flex items-end gap-2 mt-2">
                      <Input
                        type="number"
                        placeholder="Score"
                        className="w-24"
                        value={scoreDrafts[submission.id]?.score ?? ""}
                        onChange={(e) =>
                          setScoreDrafts((prev) => ({ ...prev, [submission.id]: { ...prev[submission.id], score: e.target.value, maxScore: prev[submission.id]?.maxScore ?? "100", notes: prev[submission.id]?.notes ?? "" } }))
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        className="w-24"
                        value={scoreDrafts[submission.id]?.maxScore ?? "100"}
                        onChange={(e) =>
                          setScoreDrafts((prev) => ({ ...prev, [submission.id]: { ...prev[submission.id], maxScore: e.target.value, score: prev[submission.id]?.score ?? "", notes: prev[submission.id]?.notes ?? "" } }))
                        }
                      />
                      <Button size="sm" disabled={scoringId === submission.id} onClick={() => handleScore(assessment, submission.id)}>
                        Score
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function InterviewsSection({
  assignmentId,
  entryId,
  interviews,
  onChange,
}: {
  assignmentId: string;
  entryId: string;
  interviews: AdminInterview[];
  onChange: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("video");
  const [scheduledAt, setScheduledAt] = useState("");
  const [locationOrLink, setLocationOrLink] = useState("");
  const [creating, setCreating] = useState(false);
  const [panelistId, setPanelistId] = useState<Record<string, string>>({});
  const [scorecardRecommendation, setScorecardRecommendation] = useState<Record<string, string>>({});
  const [scorecardComments, setScorecardComments] = useState<Record<string, string>>({});
  const [submittingScorecardId, setSubmittingScorecardId] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await createInterview(assignmentId, entryId, {
        type,
        scheduled_at: scheduledAt || undefined,
        location_or_link: locationOrLink || undefined,
      });
      setScheduledAt("");
      setLocationOrLink("");
      setShowForm(false);
      onChange();
    } finally {
      setCreating(false);
    }
  }

  async function handleAddPanelist(interviewId: string) {
    const value = panelistId[interviewId];
    if (!value) return;
    await addInterviewPanelMember(assignmentId, entryId, interviewId, { panelist_type: "user", panelist_id: Number(value) });
    setPanelistId((prev) => ({ ...prev, [interviewId]: "" }));
    onChange();
  }

  async function handleComplete(interviewId: string) {
    await updateInterviewStatus(assignmentId, entryId, interviewId, "completed");
    onChange();
  }

  async function handleSubmitScorecard(interviewId: string) {
    const recommendation = scorecardRecommendation[interviewId];
    if (!recommendation) return;
    setSubmittingScorecardId(interviewId);
    try {
      await submitInterviewScorecard(assignmentId, entryId, interviewId, {
        overall_recommendation: recommendation,
        panel_comments: scorecardComments[interviewId] || undefined,
      });
      setScorecardRecommendation((prev) => ({ ...prev, [interviewId]: "" }));
      setScorecardComments((prev) => ({ ...prev, [interviewId]: "" }));
      onChange();
    } finally {
      setSubmittingScorecardId(null);
    }
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-h4 font-semibold text-foreground flex items-center gap-2">
          <Users className="size-5" /> Interviews
        </h2>
        <Button size="sm" variant="secondary" onClick={() => setShowForm(!showForm)}>
          <Plus className="size-4 mr-1.5" /> Schedule Interview
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="space-y-3 border-b border-border pb-4">
          <div className="grid grid-cols-2 gap-3">
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="video">Video</option>
              <option value="phone">Phone</option>
              <option value="in_person">In Person</option>
              <option value="panel">Panel</option>
            </Select>
            <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
          </div>
          <Input placeholder="Location or meeting link" value={locationOrLink} onChange={(e) => setLocationOrLink(e.target.value)} />
          <Button type="submit" size="sm" disabled={creating}>
            Schedule
          </Button>
        </form>
      )}

      {interviews.length === 0 ? (
        <p className="text-small text-muted-foreground">No interviews scheduled yet.</p>
      ) : (
        <div className="space-y-3">
          {interviews.map((interview) => (
            <div key={interview.id} className="rounded-card border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground capitalize">{interview.type} Interview</p>
                <Badge variant="outline" className="normal-case">
                  {interview.status_label}
                </Badge>
              </div>
              <p className="text-small text-muted-foreground mt-1">
                {interview.scheduled_at ? new Date(interview.scheduled_at).toLocaleString() : "Time to be confirmed"}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="RS staff User ID"
                  className="w-40"
                  value={panelistId[interview.id] ?? ""}
                  onChange={(e) => setPanelistId((prev) => ({ ...prev, [interview.id]: e.target.value }))}
                />
                <Button size="sm" variant="secondary" onClick={() => handleAddPanelist(interview.id)}>
                  Add Panelist
                </Button>
                {interview.status !== "completed" && (
                  <Button size="sm" variant="secondary" onClick={() => handleComplete(interview.id)}>
                    Mark Completed
                  </Button>
                )}
              </div>

              {interview.panel_members.length > 0 && (
                <p className="text-small text-muted-foreground mt-2">
                  Panel: {interview.panel_members.map((m) => m.panelist_name ?? `#${m.id}`).join(", ")}
                </p>
              )}
              {interview.scorecards.length > 0 && (
                <div className="mt-2 space-y-1">
                  {interview.scorecards.map((s) => (
                    <p key={s.id} className="text-small text-foreground">
                      {s.panelist_name ?? "Panelist"}: <span className="font-medium">{s.overall_recommendation?.replace(/_/g, " ")}</span>
                      {s.panel_comments ? ` — ${s.panel_comments}` : ""}
                    </p>
                  ))}
                </div>
              )}

              <div className="mt-3 space-y-2 border-t border-border pt-3">
                <p className="text-caption font-semibold text-muted-foreground uppercase tracking-wide">
                  Submit My Scorecard
                </p>
                <div className="flex items-center gap-2">
                  <Select
                    value={scorecardRecommendation[interview.id] ?? ""}
                    onChange={(e) => setScorecardRecommendation((prev) => ({ ...prev, [interview.id]: e.target.value }))}
                    className="w-40"
                  >
                    <option value="">Recommendation…</option>
                    <option value="strong_yes">Strong Yes</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    <option value="strong_no">Strong No</option>
                  </Select>
                  <Input
                    placeholder="Comments"
                    value={scorecardComments[interview.id] ?? ""}
                    onChange={(e) => setScorecardComments((prev) => ({ ...prev, [interview.id]: e.target.value }))}
                  />
                  <Button
                    size="sm"
                    disabled={submittingScorecardId === interview.id || !scorecardRecommendation[interview.id]}
                    onClick={() => handleSubmitScorecard(interview.id)}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function ReferenceChecksSection({
  assignmentId,
  entryId,
  referenceChecks,
  onChange,
}: {
  assignmentId: string;
  entryId: string;
  referenceChecks: AdminReferenceCheck[];
  onChange: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [refereeName, setRefereeName] = useState("");
  const [refereeRelationship, setRefereeRelationship] = useState("");
  const [refereeContact, setRefereeContact] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await createReferenceCheck(assignmentId, entryId, {
        referee_name: refereeName,
        referee_relationship: refereeRelationship || undefined,
        referee_contact: refereeContact || undefined,
        candidate_consented: true,
        consent_text_version: "v1",
      });
      setRefereeName("");
      setRefereeRelationship("");
      setRefereeContact("");
      setShowForm(false);
      onChange();
    } finally {
      setCreating(false);
    }
  }

  async function handleOutcome(id: string, outcome: string) {
    await updateReferenceCheck(assignmentId, entryId, id, { status: "completed", final_outcome: outcome });
    onChange();
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-h4 font-semibold text-foreground">Reference Checks</h2>
        <Button size="sm" variant="secondary" onClick={() => setShowForm(!showForm)}>
          <Plus className="size-4 mr-1.5" /> New Reference Check
        </Button>
      </div>
      <p className="text-caption text-muted-foreground">
        Requires the candidate&apos;s recorded consent — checking &quot;New Reference Check&quot; confirms consent was obtained.
      </p>

      {showForm && (
        <form onSubmit={handleCreate} className="space-y-3 border-b border-border pb-4">
          <Input placeholder="Referee name" value={refereeName} onChange={(e) => setRefereeName(e.target.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Relationship" value={refereeRelationship} onChange={(e) => setRefereeRelationship(e.target.value)} />
            <Input placeholder="Contact (email or phone)" value={refereeContact} onChange={(e) => setRefereeContact(e.target.value)} />
          </div>
          <Button type="submit" size="sm" disabled={creating || !refereeName.trim()}>
            Request Reference Check
          </Button>
        </form>
      )}

      {referenceChecks.length === 0 ? (
        <p className="text-small text-muted-foreground">No reference checks yet.</p>
      ) : (
        <div className="space-y-3">
          {referenceChecks.map((rc) => (
            <div key={rc.id} className="rounded-card border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground">{rc.referee_name}</p>
                <Badge variant="outline" className="normal-case">
                  {rc.status_label}
                </Badge>
              </div>
              <p className="text-small text-muted-foreground mt-1">{rc.referee_relationship}</p>
              {rc.final_outcome ? (
                <p className="text-small font-semibold text-foreground mt-2 capitalize">Outcome: {rc.final_outcome}</p>
              ) : (
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="secondary" onClick={() => handleOutcome(rc.id, "positive")}>
                    Positive
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleOutcome(rc.id, "negative")}>
                    Negative
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function PlacementSection({ assignmentId, entryId }: { assignmentId: string; entryId: string }) {
  const [placement, setPlacement] = useState<AdminPlacement | null | undefined>(undefined);
  const [feedback, setFeedback] = useState<AdminAssignmentFeedback[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [engagementType, setEngagementType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deploymentLocation, setDeploymentLocation] = useState("");
  const [deploymentNotes, setDeploymentNotes] = useState("");
  const [creating, setCreating] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(() => {
    getPlacement(assignmentId, entryId)
      .then((res) => setPlacement(res.data))
      .catch(() => setPlacement(null));
  }, [assignmentId, entryId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (placement?.status !== "confirmed") return;
    listAssignmentFeedback(assignmentId, entryId)
      .then((res) => setFeedback(res.data))
      .catch(() => setFeedback([]));
  }, [assignmentId, entryId, placement?.status]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await createPlacement(assignmentId, entryId, {
        engagement_type: engagementType || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        deployment_location: deploymentLocation || undefined,
        deployment_notes: deploymentNotes || undefined,
      });
      setShowForm(false);
      load();
    } finally {
      setCreating(false);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      await cancelPlacement(assignmentId, entryId);
      load();
    } finally {
      setCancelling(false);
    }
  }

  if (placement === undefined) return null;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-h4 font-semibold text-foreground flex items-center gap-2">
          <Briefcase className="size-5" /> Placement
        </h2>
        {!placement && !showForm && (
          <Button size="sm" variant="secondary" onClick={() => setShowForm(true)}>
            <Plus className="size-4 mr-1.5" /> Create Placement
          </Button>
        )}
      </div>

      {!placement && showForm && (
        <form onSubmit={handleCreate} className="space-y-3 border-b border-border pb-4">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Engagement type" value={engagementType} onChange={(e) => setEngagementType(e.target.value)} />
            <Input placeholder="Deployment location" value={deploymentLocation} onChange={(e) => setDeploymentLocation(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input type="date" placeholder="Start date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input type="date" placeholder="End date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <Textarea placeholder="Deployment notes" rows={2} value={deploymentNotes} onChange={(e) => setDeploymentNotes(e.target.value)} />
          <Button type="submit" size="sm" disabled={creating}>
            Create Placement
          </Button>
        </form>
      )}

      {!placement && !showForm && (
        <p className="text-small text-muted-foreground">No placement has been created for this candidate yet.</p>
      )}

      {placement && (
        <div className="rounded-card border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-medium text-foreground">{placement.engagement_type ?? "Placement"}</p>
            <Badge variant="outline" className="normal-case">
              {placement.status_label}
            </Badge>
          </div>
          {placement.deployment_location && <p className="text-small text-muted-foreground">{placement.deployment_location}</p>}
          <div className="grid grid-cols-2 gap-2 text-small">
            <p>
              Organisation confirmed:{" "}
              <span className="font-medium text-foreground">
                {placement.organisation_confirmed_at ? new Date(placement.organisation_confirmed_at).toLocaleString() : "Pending"}
              </span>
            </p>
            <p>
              Professional confirmed:{" "}
              <span className="font-medium text-foreground">
                {placement.professional_confirmed_at ? new Date(placement.professional_confirmed_at).toLocaleString() : "Pending"}
              </span>
            </p>
          </div>
          {placement.status !== "confirmed" && (
            <Button size="sm" variant="secondary" disabled={cancelling} onClick={handleCancel}>
              Cancel Placement
            </Button>
          )}

          {placement.status === "confirmed" && (
            <div className="border-t border-border pt-3">
              <p className="text-caption font-semibold text-muted-foreground uppercase tracking-wide mb-2">Assignment Feedback</p>
              {feedback.length === 0 ? (
                <p className="text-small text-muted-foreground">No feedback submitted yet.</p>
              ) : (
                <div className="space-y-2">
                  {feedback.map((f) => (
                    <div key={f.id} className="rounded-card bg-muted/30 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-small font-medium text-foreground">{f.submitter_name ?? f.submitter_type}</p>
                        {f.rating && <Badge variant="outline">{f.rating} / 5</Badge>}
                      </div>
                      {f.comments && <p className="text-small text-muted-foreground mt-1">{f.comments}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
