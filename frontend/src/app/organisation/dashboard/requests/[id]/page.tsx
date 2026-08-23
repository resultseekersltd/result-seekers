"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getTalentRequest } from "@/lib/api/organisation";
import type { TalentRequest } from "@/types/organisation";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function OrganisationRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const [request, setRequest] = useState<TalentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTalentRequest(params.id)
      .then((res) => setRequest(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !request) {
    return <Card className="p-8 text-center text-danger">{error ?? "Request not found."}</Card>;
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <Link
          href="/organisation/dashboard/requests"
          className="inline-flex items-center gap-1.5 text-small text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="size-4" /> Back to Requests
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h2 font-bold tracking-tight text-foreground">{request.title}</h1>
            <p className="text-small text-muted-foreground mt-1">{request.reference}</p>
          </div>
          <Badge variant="outline">{request.status.replace(/_/g, " ")}</Badge>
        </div>
      </div>

      <Card className="p-6 md:p-8 space-y-4 max-w-2xl">
        <div>
          <p className="text-small font-semibold text-muted-foreground uppercase tracking-wide">Description</p>
          <p className="text-body text-foreground mt-1 whitespace-pre-wrap">{request.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-small font-semibold text-muted-foreground uppercase tracking-wide">Number Required</p>
            <p className="text-body text-foreground mt-1">{request.number_required}</p>
          </div>
          {request.location && (
            <div>
              <p className="text-small font-semibold text-muted-foreground uppercase tracking-wide">Location</p>
              <p className="text-body text-foreground mt-1">{request.location}</p>
            </div>
          )}
          {request.deadline && (
            <div>
              <p className="text-small font-semibold text-muted-foreground uppercase tracking-wide">Deadline</p>
              <p className="text-body text-foreground mt-1">{request.deadline}</p>
            </div>
          )}
          {request.submitted_at && (
            <div>
              <p className="text-small font-semibold text-muted-foreground uppercase tracking-wide">Submitted</p>
              <p className="text-body text-foreground mt-1">{new Date(request.submitted_at).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </Card>

      <p className="text-small text-muted-foreground max-w-2xl">
        Our recruitment team will review your request and follow up with next steps. You&apos;ll be able to
        review shortlisted, consented candidates here once your assignment reaches that stage.
      </p>
    </div>
  );
}
