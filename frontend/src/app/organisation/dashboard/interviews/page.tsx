"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { getOrganisationInterviews, submitOrganisationScorecard } from "@/lib/api/organisation";
import type { OrganisationInterview } from "@/types/organisation";
import { CalendarClock, Send } from "lucide-react";

const STATUS_VARIANT: Record<string, "neutral" | "accent" | "success" | "outline"> = {
  scheduled: "accent",
  confirmed: "success",
  completed: "success",
  cancelled: "neutral",
  no_show: "neutral",
  rescheduled: "outline",
};

export default function OrganisationInterviewsPage() {
  const [interviews, setInterviews] = useState<OrganisationInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [recommendation, setRecommendation] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    getOrganisationInterviews()
      .then((res) => setInterviews(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleSubmitFeedback(interview: OrganisationInterview) {
    const overall = recommendation[interview.id] || "yes";
    setSubmittingId(interview.id);
    try {
      await submitOrganisationScorecard(interview.id, {
        overall_recommendation: overall,
        panel_comments: comments[interview.id] || undefined,
      });
      load();
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-4">
        <h1 className="text-h2 font-bold tracking-tight text-foreground flex items-center gap-2">
          <CalendarClock className="size-6 text-primary" />
          Interviews
        </h1>
        <p className="text-body text-muted-foreground mt-1 max-w-2xl">
          Interviews Result Seekers has scheduled for your released candidates. If you&apos;ve been added as a
          panel member, you can submit your own feedback here.
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <ErrorState description="We couldn't load interviews." retry={{ label: "Retry", onRetry: load }} />
      ) : interviews.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No interviews yet" description="Scheduled interviews for your released candidates will appear here." />
      ) : (
        <div className="space-y-4">
          {interviews.map((interview) => (
            <Card key={interview.id} className="p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground capitalize">{interview.type} Interview</p>
                  <p className="text-small text-muted-foreground">
                    {interview.scheduled_at ? new Date(interview.scheduled_at).toLocaleString() : "Time to be confirmed"}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[interview.status] ?? "outline"} className="normal-case">
                  {interview.status_label}
                </Badge>
              </div>

              {interview.is_panel_member && (
                <div className="border-t border-border pt-3">
                  {interview.my_scorecard ? (
                    <div className="rounded-card border border-border bg-muted/30 p-3">
                      <p className="text-small font-semibold text-foreground">
                        Your feedback: {interview.my_scorecard.overall_recommendation?.replace(/_/g, " ")}
                      </p>
                      {interview.my_scorecard.panel_comments && (
                        <p className="text-small text-muted-foreground mt-1">{interview.my_scorecard.panel_comments}</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Select
                        value={recommendation[interview.id] ?? "yes"}
                        onChange={(e) => setRecommendation((prev) => ({ ...prev, [interview.id]: e.target.value }))}
                      >
                        <option value="strong_yes">Strong Yes</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="strong_no">Strong No</option>
                      </Select>
                      <Textarea
                        placeholder="Comments..."
                        rows={2}
                        value={comments[interview.id] ?? ""}
                        onChange={(e) => setComments((prev) => ({ ...prev, [interview.id]: e.target.value }))}
                      />
                      <Button
                        size="sm"
                        disabled={submittingId === interview.id}
                        onClick={() => handleSubmitFeedback(interview)}
                      >
                        <Send className="size-4 mr-1.5" /> Submit Feedback
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
