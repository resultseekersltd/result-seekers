"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { confirmInterview, getInterviews } from "@/lib/api/expert-pool";
import type { Interview } from "@/types/expert-pool";
import { CalendarCheck, CheckCircle2 } from "lucide-react";

const STATUS_VARIANT: Record<string, "neutral" | "accent" | "success" | "outline"> = {
  scheduled: "accent",
  confirmed: "success",
  completed: "success",
  cancelled: "neutral",
  no_show: "neutral",
  rescheduled: "outline",
};

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    getInterviews()
      .then((res) => setInterviews(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleConfirm(id: string) {
    setConfirmingId(id);
    try {
      const res = await confirmInterview(id);
      setInterviews((prev) => prev.map((i) => (i.id === id ? res.data : i)));
    } finally {
      setConfirmingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-4">
        <h1 className="text-h2 font-bold tracking-tight text-foreground flex items-center gap-2">
          <CalendarCheck className="size-6 text-primary" />
          Interviews
        </h1>
        <p className="text-body text-muted-foreground mt-1 max-w-2xl">
          Interview details Result Seekers has scheduled for you as part of an active recruitment process.
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <ErrorState description="We couldn't load your interviews." retry={{ label: "Retry", onRetry: load }} />
      ) : interviews.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No interviews scheduled" description="Scheduled interviews will appear here." />
      ) : (
        <div className="space-y-3">
          {interviews.map((interview) => (
            <Card key={interview.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground capitalize">{interview.type} Interview</p>
                  <p className="text-small text-muted-foreground">
                    {interview.scheduled_at ? new Date(interview.scheduled_at).toLocaleString() : "Time to be confirmed"}
                    {interview.timezone ? ` (${interview.timezone})` : ""}
                  </p>
                  {interview.location_or_link && (
                    <p className="text-small text-muted-foreground mt-1">{interview.location_or_link}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={STATUS_VARIANT[interview.status] ?? "outline"} className="normal-case">
                    {interview.status_label}
                  </Badge>
                  {!interview.candidate_confirmed_at && interview.status === "scheduled" && (
                    <Button size="sm" disabled={confirmingId === interview.id} onClick={() => handleConfirm(interview.id)}>
                      <CheckCircle2 className="size-4 mr-1.5" /> Confirm Attendance
                    </Button>
                  )}
                  {interview.candidate_confirmed_at && (
                    <span className="text-small text-success font-medium">Confirmed</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
