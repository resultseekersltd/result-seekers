"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { getReleasedCandidates } from "@/lib/api/organisation";
import type { ReleasedCandidate } from "@/types/organisation";
import { UserCheck } from "lucide-react";

const STATUS_VARIANT: Record<string, "neutral" | "accent" | "success" | "outline"> = {
  pending: "outline",
  interested: "accent",
  not_interested: "neutral",
};

export default function ReleasedCandidatesPage() {
  const [candidates, setCandidates] = useState<ReleasedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    getReleasedCandidates()
      .then((res) => setCandidates(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-4">
        <h1 className="text-h2 font-bold tracking-tight text-foreground flex items-center gap-2">
          <UserCheck className="size-6 text-primary" />
          Released Candidates
        </h1>
        <p className="text-body text-muted-foreground mt-1 max-w-2xl">
          Candidates appear here only once Result Seekers has screened, reviewed, and secured their explicit
          consent to share their profile with you. This is not a search of our full professional database.
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <ErrorState description="We couldn't load your released candidates." retry={{ label: "Retry", onRetry: load }} />
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No candidates released yet"
          description="Once our recruitment team completes screening and secures a candidate's consent, they'll appear here for your review."
        />
      ) : (
        <div className="space-y-3">
          {candidates.map((c) => (
            <Card key={c.id} className="p-4">
              <Link
                href={`/organisation/dashboard/released-candidates/${c.id}`}
                className="flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-semibold text-foreground">{c.candidate.professional_title ?? "Candidate"}</p>
                  <p className="text-small text-muted-foreground font-mono">{c.candidate.candidate_reference}</p>
                  <p className="text-small text-muted-foreground mt-1">
                    {[c.candidate.country, c.candidate.years_experience ? `${c.candidate.years_experience} yrs experience` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {typeof c.comments_count === "number" && c.comments_count > 0 && (
                    <span className="text-small text-muted-foreground">{c.comments_count} comment{c.comments_count === 1 ? "" : "s"}</span>
                  )}
                  <Badge variant={STATUS_VARIANT[c.organisation_status ?? "pending"] ?? "outline"} className="normal-case">
                    {(c.organisation_status ?? "pending").replace(/_/g, " ")}
                  </Badge>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
