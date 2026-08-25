"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { getOpportunities, respondToOpportunity } from "@/lib/api/expert-pool";
import type { Opportunity } from "@/types/expert-pool";
import { Check, Sparkles, X } from "lucide-react";

const STATUS_VARIANT: Record<string, "neutral" | "accent" | "success" | "outline"> = {
  sent: "accent",
  accepted: "success",
  declined: "neutral",
  expired: "neutral",
  withdrawn: "neutral",
};

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    getOpportunities()
      .then((res) => setOpportunities(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleRespond(id: string, response: "accept" | "decline") {
    setRespondingId(id);
    try {
      const res = await respondToOpportunity(id, response);
      setOpportunities((prev) => prev.map((o) => (o.id === id ? res.data : o)));
    } finally {
      setRespondingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-4">
        <h1 className="text-h2 font-bold tracking-tight text-foreground flex items-center gap-2">
          <Sparkles className="size-6 text-primary" />
          Opportunities
        </h1>
        <p className="text-body text-muted-foreground mt-1 max-w-2xl">
          Result Seekers has shortlisted you for the assignments below. Accepting an invitation lets our
          recruitment team request your consent before sharing your profile with the client organisation.
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <ErrorState description="We couldn't load your opportunities." retry={{ label: "Retry", onRetry: load }} />
      ) : opportunities.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No opportunities yet"
          description="When Result Seekers shortlists you for an assignment, it will appear here."
        />
      ) : (
        <div className="space-y-3">
          {opportunities.map((o) => (
            <Card key={o.id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">{o.assignment_reference ?? "Recruitment Opportunity"}</p>
                  <p className="text-small text-muted-foreground">
                    {o.sent_at ? `Sent ${new Date(o.sent_at).toLocaleDateString()}` : null}
                    {o.expires_at ? ` · Expires ${new Date(o.expires_at).toLocaleDateString()}` : null}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={STATUS_VARIANT[o.status] ?? "outline"} className="normal-case">
                    {o.status}
                  </Badge>
                  {o.status === "sent" && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        disabled={respondingId === o.id}
                        onClick={() => handleRespond(o.id, "accept")}
                      >
                        <Check className="size-4 mr-1.5" /> Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={respondingId === o.id}
                        onClick={() => handleRespond(o.id, "decline")}
                      >
                        <X className="size-4 mr-1.5" /> Decline
                      </Button>
                    </div>
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
