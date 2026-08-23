"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { downloadAssessmentFile, getAssessments, submitAssessment, submitAssessmentWithFile } from "@/lib/api/expert-pool";
import type { Assessment } from "@/types/expert-pool";
import { ClipboardCheck, Send } from "lucide-react";

const STATUS_VARIANT: Record<string, "neutral" | "accent" | "success" | "outline"> = {
  assigned: "accent",
  in_progress: "accent",
  submitted: "outline",
  under_review: "outline",
  reviewed: "success",
  expired: "neutral",
  cancelled: "neutral",
};

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    getAssessments()
      .then((res) => setAssessments(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleSubmit(assessment: Assessment) {
    const responseText = drafts[assessment.id]?.trim();
    const file = files[assessment.id];
    if (!responseText && !file) return;
    setSubmittingId(assessment.id);
    try {
      const res = file
        ? await submitAssessmentWithFile(assessment.id, { response_text: responseText || undefined, file })
        : await submitAssessment(assessment.id, { response_text: responseText });
      setAssessments((prev) => prev.map((a) => (a.id === assessment.id ? res.data : a)));
    } finally {
      setSubmittingId(null);
    }
  }

  async function handleDownload(assessment: Assessment) {
    const submissionId = assessment.my_submission?.id;
    if (!submissionId) return;
    setDownloadingId(assessment.id);
    try {
      const blob = await downloadAssessmentFile(assessment.id, submissionId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = assessment.my_submission?.file_original_name ?? "submission";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-4">
        <h1 className="text-h2 font-bold tracking-tight text-foreground flex items-center gap-2">
          <ClipboardCheck className="size-6 text-primary" />
          Assessments
        </h1>
        <p className="text-body text-muted-foreground mt-1 max-w-2xl">
          Result Seekers may assign a short assessment as part of an active recruitment process. Results are
          reviewed by a human reviewer and only shared with you where the recruiter has enabled visibility.
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <ErrorState description="We couldn't load your assessments." retry={{ label: "Retry", onRetry: load }} />
      ) : assessments.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No assessments yet"
          description="If a recruiter assigns you an assessment for an active opportunity, it will appear here."
        />
      ) : (
        <div className="space-y-4">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">{assessment.title}</p>
                  <p className="text-small text-muted-foreground mt-1">
                    {assessment.time_limit_minutes ? `${assessment.time_limit_minutes} min time limit` : null}
                    {assessment.attempt_limit ? ` · ${assessment.attempt_limit} attempt${assessment.attempt_limit === 1 ? "" : "s"} allowed` : null}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[assessment.status] ?? "outline"} className="normal-case">
                  {assessment.status_label}
                </Badge>
              </div>

              {assessment.instructions && (
                <p className="text-body text-foreground whitespace-pre-wrap">{assessment.instructions}</p>
              )}

              {assessment.my_submission ? (
                <div className="rounded-card border border-border bg-muted/30 p-3">
                  <p className="text-caption font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Your Response (Attempt {assessment.my_submission.attempt_number})
                  </p>
                  <p className="text-body text-foreground whitespace-pre-wrap">{assessment.my_submission.response_text}</p>
                  {assessment.my_submission.has_file && (
                    <Button
                      size="sm"
                      variant="link"
                      className="mt-2"
                      disabled={downloadingId === assessment.id}
                      onClick={() => handleDownload(assessment)}
                    >
                      Download {assessment.my_submission.file_original_name ?? "your file"}
                    </Button>
                  )}
                  {assessment.result && (
                    <p className="text-small font-semibold text-success mt-2">
                      Score: {assessment.result.score} / {assessment.result.max_score}
                    </p>
                  )}
                </div>
              ) : assessment.status === "assigned" || assessment.status === "in_progress" ? (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Write your response..."
                    value={drafts[assessment.id] ?? ""}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [assessment.id]: e.target.value }))}
                    rows={4}
                  />
                  <input
                    type="file"
                    onChange={(e) => setFiles((prev) => ({ ...prev, [assessment.id]: e.target.files?.[0] }))}
                    className="text-small text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-small file:font-medium file:text-foreground"
                  />
                  <Button
                    size="sm"
                    disabled={submittingId === assessment.id || (!drafts[assessment.id]?.trim() && !files[assessment.id])}
                    onClick={() => handleSubmit(assessment)}
                  >
                    <Send className="size-4 mr-1.5" /> Submit Response
                  </Button>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
