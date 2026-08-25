"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  addReleasedCandidateComment,
  createCandidateEvaluation,
  getCandidateEvaluations,
  getReleasedCandidate,
  updateReleasedCandidateStatus,
} from "@/lib/api/organisation";
import type { CandidateEvaluation, ReleasedCandidate, ReleasedCandidateComment } from "@/types/organisation";
import { ArrowLeft, ClipboardList, Loader2, ThumbsDown, ThumbsUp } from "lucide-react";

const FIELD_LABELS: Record<string, string> = {
  professional_title: "Professional Title",
  years_experience: "Years of Experience",
  highest_qualification: "Highest Qualification",
  country: "Country",
  state: "State / Region",
  verification_level: "Verification Level",
};

export default function ReleasedCandidateDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [candidate, setCandidate] = useState<ReleasedCandidate | null>(null);
  const [comments, setComments] = useState<ReleasedCandidateComment[]>([]);
  const [evaluations, setEvaluations] = useState<CandidateEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const [evalScore, setEvalScore] = useState("");
  const [evalRecommendation, setEvalRecommendation] = useState("");
  const [evalNotes, setEvalNotes] = useState("");
  const [evalOutcome, setEvalOutcome] = useState("pending");
  const [submittingEvaluation, setSubmittingEvaluation] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    Promise.all([getReleasedCandidate(id), getCandidateEvaluations(id)])
      .then(([candidateRes, evaluationsRes]) => {
        setCandidate(candidateRes.data);
        setEvaluations(evaluationsRes.data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleStatus(status: "interested" | "not_interested") {
    setUpdatingStatus(true);
    try {
      const res = await updateReleasedCandidateStatus(id, status);
      setCandidate(res.data);
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await addReleasedCandidateComment(id, commentText.trim());
      setComments((prev) => [...prev, res.data]);
      setCommentText("");
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleAddEvaluation(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingEvaluation(true);
    try {
      const res = await createCandidateEvaluation(id, {
        score: evalScore ? Number(evalScore) : undefined,
        recommendation: evalRecommendation || undefined,
        criteria_notes: evalNotes || undefined,
        final_outcome: evalOutcome,
      });
      setEvaluations((prev) => [res.data, ...prev.filter((e) => e.organisation_user_id !== res.data.organisation_user_id)]);
      setEvalScore("");
      setEvalRecommendation("");
      setEvalNotes("");
      setEvalOutcome("pending");
    } finally {
      setSubmittingEvaluation(false);
    }
  }

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (error || !candidate) {
    return <ErrorState description="We couldn't load this candidate." retry={{ label: "Retry", onRetry: load }} />;
  }

  const fields = candidate.candidate;

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <Link
          href="/organisation/dashboard/released-candidates"
          className="inline-flex items-center gap-1.5 text-small text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="size-4" /> Back to Released Candidates
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-h2 font-bold tracking-tight text-foreground">{fields.professional_title ?? "Candidate"}</h1>
            <p className="text-small text-muted-foreground mt-1 font-mono">{fields.candidate_reference}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={candidate.organisation_status === "interested" ? "primary" : "secondary"}
              disabled={updatingStatus}
              onClick={() => handleStatus("interested")}
            >
              <ThumbsUp className="size-4 mr-1.5" /> Interested
            </Button>
            <Button
              size="sm"
              variant={candidate.organisation_status === "not_interested" ? "primary" : "secondary"}
              disabled={updatingStatus}
              onClick={() => handleStatus("not_interested")}
            >
              <ThumbsDown className="size-4 mr-1.5" /> Not Interested
            </Button>
          </div>
        </div>
      </div>

      <Card className="p-6 md:p-8 space-y-4 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          {(Object.keys(FIELD_LABELS) as (keyof typeof FIELD_LABELS)[]).map((key) => {
            const value = fields[key as keyof typeof fields];
            if (!value) return null;
            return (
              <div key={key}>
                <p className="text-small font-semibold text-muted-foreground uppercase tracking-wide">
                  {FIELD_LABELS[key]}
                </p>
                <p className="text-body text-foreground mt-1 normal-case">{String(value).replace(/_/g, " ")}</p>
              </div>
            );
          })}
        </div>

        {fields.disciplines?.length > 0 && (
          <div>
            <p className="text-small font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Disciplines</p>
            <div className="flex flex-wrap gap-1.5">
              {fields.disciplines.map((d) => (
                <Badge key={d} variant="outline" className="normal-case">
                  {d}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {fields.languages && fields.languages.length > 0 && (
          <div>
            <p className="text-small font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Languages</p>
            <div className="flex flex-wrap gap-1.5">
              {fields.languages.map((l) => (
                <Badge key={l} variant="outline" className="normal-case">
                  {l}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6 md:p-8 space-y-4 max-w-2xl">
        <h2 className="text-h4 font-semibold text-foreground">Notes &amp; Comments</h2>

        {comments.length > 0 && (
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="rounded-card border border-border bg-muted/30 p-3">
                <p className="text-body text-foreground whitespace-pre-wrap">{c.comment}</p>
                <p className="text-caption text-muted-foreground mt-1">{new Date(c.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddComment} className="space-y-3">
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add an internal note about this candidate..."
            rows={3}
          />
          <Button type="submit" size="sm" disabled={submittingComment || !commentText.trim()}>
            {submittingComment ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : null}
            Add Comment
          </Button>
        </form>
      </Card>

      <Card className="p-6 md:p-8 space-y-4 max-w-2xl">
        <h2 className="text-h4 font-semibold text-foreground flex items-center gap-2">
          <ClipboardList className="size-5" /> Evaluation
        </h2>
        <p className="text-small text-muted-foreground">
          Record your team&apos;s scoring and decision for this candidate. Each evaluator&apos;s score is kept
          separate so multiple reviewers can score independently.
        </p>

        {evaluations.length > 0 && (
          <div className="space-y-3">
            {evaluations.map((evaluation) => (
              <div key={evaluation.id} className="rounded-card border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-small font-semibold text-foreground">{evaluation.evaluator_name ?? "Evaluator"}</p>
                  {evaluation.final_outcome && (
                    <Badge
                      variant={evaluation.final_outcome === "selected" ? "success" : evaluation.final_outcome === "not_selected" ? "neutral" : "outline"}
                      className="normal-case"
                    >
                      {evaluation.final_outcome.replace(/_/g, " ")}
                    </Badge>
                  )}
                </div>
                {evaluation.score && <p className="text-small text-muted-foreground mt-1">Score: {evaluation.score}</p>}
                {evaluation.recommendation && <p className="text-body text-foreground mt-1">{evaluation.recommendation}</p>}
                {evaluation.criteria_notes && (
                  <p className="text-small text-muted-foreground mt-1 whitespace-pre-wrap">{evaluation.criteria_notes}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddEvaluation} className="space-y-3 border-t border-border pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="eval-score" className="text-small font-semibold text-muted-foreground uppercase tracking-wide">
                Score (0–100)
              </label>
              <Input
                id="eval-score"
                type="number"
                min={0}
                max={100}
                value={evalScore}
                onChange={(e) => setEvalScore(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="eval-outcome" className="text-small font-semibold text-muted-foreground uppercase tracking-wide">
                Outcome
              </label>
              <Select id="eval-outcome" value={evalOutcome} onChange={(e) => setEvalOutcome(e.target.value)} className="mt-1">
                <option value="pending">Pending</option>
                <option value="selected">Selected</option>
                <option value="not_selected">Not Selected</option>
              </Select>
            </div>
          </div>
          <div>
            <label htmlFor="eval-recommendation" className="text-small font-semibold text-muted-foreground uppercase tracking-wide">
              Recommendation
            </label>
            <Input
              id="eval-recommendation"
              value={evalRecommendation}
              onChange={(e) => setEvalRecommendation(e.target.value)}
              placeholder="e.g. Proceed to offer"
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="eval-notes" className="text-small font-semibold text-muted-foreground uppercase tracking-wide">
              Notes
            </label>
            <Textarea
              id="eval-notes"
              value={evalNotes}
              onChange={(e) => setEvalNotes(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
          <Button type="submit" size="sm" disabled={submittingEvaluation}>
            {submittingEvaluation ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : null}
            Save Evaluation
          </Button>
        </form>
      </Card>
    </div>
  );
}
