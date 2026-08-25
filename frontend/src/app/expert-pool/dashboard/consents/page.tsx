"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { getConsents, respondToConsent, withdrawConsent } from "@/lib/api/expert-pool";
import type { Consent } from "@/types/expert-pool";
import { Check, ShieldCheck, X } from "lucide-react";

const STATUS_VARIANT: Record<string, "neutral" | "accent" | "success" | "outline"> = {
  requested: "accent",
  consented: "success",
  declined: "neutral",
  withdrawn: "neutral",
};

export default function ConsentsPage() {
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    getConsents()
      .then((res) => setConsents(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleRespond(id: string, response: "grant" | "decline") {
    setActingId(id);
    try {
      const res = await respondToConsent(id, response);
      setConsents((prev) => prev.map((c) => (c.id === id ? res.data : c)));
    } finally {
      setActingId(null);
    }
  }

  async function handleWithdraw(id: string) {
    setActingId(id);
    try {
      const res = await withdrawConsent(id);
      setConsents((prev) => prev.map((c) => (c.id === id ? res.data : c)));
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-4">
        <h1 className="text-h2 font-bold tracking-tight text-foreground flex items-center gap-2">
          <ShieldCheck className="size-6 text-primary" />
          Consent Requests
        </h1>
        <p className="text-body text-muted-foreground mt-1 max-w-2xl">
          Before Result Seekers shares your profile with an organisation, we ask for your explicit consent
          each time. Consent for one opportunity is never treated as consent for another.
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <ErrorState description="We couldn't load your consent requests." retry={{ label: "Retry", onRetry: load }} />
      ) : consents.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No consent requests yet"
          description="If a recruiter wants to share your profile with an organisation, you'll be asked to consent here first."
        />
      ) : (
        <div className="space-y-3">
          {consents.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">{c.purpose ?? "Profile disclosure request"}</p>
                  <p className="text-small text-muted-foreground">
                    {c.requested_at ? `Requested ${new Date(c.requested_at).toLocaleDateString()}` : null}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={STATUS_VARIANT[c.status] ?? "outline"} className="normal-case">
                    {c.status}
                  </Badge>
                  {c.status === "requested" && (
                    <div className="flex items-center gap-2">
                      <Button size="sm" disabled={actingId === c.id} onClick={() => handleRespond(c.id, "grant")}>
                        <Check className="size-4 mr-1.5" /> Grant
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={actingId === c.id}
                        onClick={() => handleRespond(c.id, "decline")}
                      >
                        <X className="size-4 mr-1.5" /> Decline
                      </Button>
                    </div>
                  )}
                  {c.status === "consented" && (
                    <Button size="sm" variant="secondary" disabled={actingId === c.id} onClick={() => handleWithdraw(c.id)}>
                      Withdraw
                    </Button>
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
