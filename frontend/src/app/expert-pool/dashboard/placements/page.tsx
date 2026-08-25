"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { confirmPlacement, getFeedback, getPlacements, submitFeedback } from "@/lib/api/expert-pool";
import type { AssignmentFeedback, Placement } from "@/types/expert-pool";
import { Award, Send } from "lucide-react";

const STATUS_VARIANT: Record<string, "neutral" | "accent" | "success" | "outline"> = {
  pending_confirmation: "accent",
  confirmed: "success",
  cancelled: "neutral",
};

export default function ExpertPlacementsPage() {
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    getPlacements()
      .then((res) => setPlacements(res.data))
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
      await confirmPlacement(id);
      load();
    } finally {
      setConfirmingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-4">
        <h1 className="text-h2 font-bold tracking-tight text-foreground flex items-center gap-2">
          <Award className="size-6 text-primary" />
          Placements
        </h1>
        <p className="text-body text-muted-foreground mt-1 max-w-2xl">
          Confirm placements Result Seekers has recorded for you, and share feedback once a placement is confirmed.
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <ErrorState description="We couldn't load placements." retry={{ label: "Retry", onRetry: load }} />
      ) : placements.length === 0 ? (
        <EmptyState icon={Award} title="No placements yet" description="Placements recorded for you will appear here." />
      ) : (
        <div className="space-y-4">
          {placements.map((placement) => (
            <PlacementCard key={placement.id} placement={placement} confirming={confirmingId === placement.id} onConfirm={() => handleConfirm(placement.id)} onChange={load} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlacementCard({
  placement,
  confirming,
  onConfirm,
  onChange,
}: {
  placement: Placement;
  confirming: boolean;
  onConfirm: () => void;
  onChange: () => void;
}) {
  const [feedback, setFeedback] = useState<AssignmentFeedback[]>([]);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (placement.status !== "confirmed") return;
    getFeedback(placement.id)
      .then((res) => setFeedback(res.data))
      .catch(() => setFeedback([]));
  }, [placement.id, placement.status]);

  const myFeedback = feedback.find((f) => f.is_mine);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await submitFeedback(placement.id, { rating, comments: comments || undefined });
      const res = await getFeedback(placement.id);
      setFeedback(res.data);
      onChange();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-foreground">{placement.engagement_type ?? "Placement"}</p>
          {placement.deployment_location && <p className="text-small text-muted-foreground">{placement.deployment_location}</p>}
        </div>
        <Badge variant={STATUS_VARIANT[placement.status] ?? "outline"} className="normal-case">
          {placement.status_label}
        </Badge>
      </div>

      {placement.status === "pending_confirmation" && (
        <div className="border-t border-border pt-3">
          {placement.professional_confirmed_at ? (
            <p className="text-small text-muted-foreground">
              You confirmed this placement on {new Date(placement.professional_confirmed_at).toLocaleString()}. Waiting on the
              organisation to confirm.
            </p>
          ) : (
            <Button size="sm" disabled={confirming} onClick={onConfirm}>
              Confirm Placement
            </Button>
          )}
        </div>
      )}

      {placement.status === "confirmed" && (
        <div className="border-t border-border pt-3">
          {myFeedback ? (
            <div className="rounded-card border border-border bg-muted/30 p-3">
              <p className="text-small font-semibold text-foreground">Your feedback: {myFeedback.rating} / 5</p>
              {myFeedback.comments && <p className="text-small text-muted-foreground mt-1">{myFeedback.comments}</p>}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-caption font-semibold text-muted-foreground uppercase tracking-wide">Rate this placement</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={`size-8 rounded-full border text-small font-medium ${
                      n <= rating ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <Textarea placeholder="Comments..." rows={2} value={comments} onChange={(e) => setComments(e.target.value)} />
              <Button size="sm" disabled={submitting} onClick={handleSubmit}>
                <Send className="size-4 mr-1.5" /> Submit Feedback
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
