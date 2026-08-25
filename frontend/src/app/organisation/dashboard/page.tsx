"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getProfile, getTalentRequests } from "@/lib/api/organisation";
import type { Organisation, TalentRequest } from "@/types/organisation";
import { Building2, ClipboardList, Loader2, Plus } from "lucide-react";

const STATUS_VARIANT: Record<string, "success" | "primary" | "neutral" | "outline"> = {
  verified: "success",
  pending_verification: "primary",
  clarification_requested: "primary",
  rejected: "outline",
  suspended: "outline",
  restricted: "outline",
  archived: "neutral",
  draft: "neutral",
};

export default function OrganisationDashboardOverviewPage() {
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [requests, setRequests] = useState<TalentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProfile(), getTalentRequests()])
      .then(([profileRes, requestsRes]) => {
        setOrganisation(profileRes.data);
        setRequests(requestsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-4">
        <h1 className="text-h2 font-bold tracking-tight text-foreground">
          Welcome{organisation ? `, ${organisation.name}` : ""}
        </h1>
        <p className="text-body text-muted-foreground mt-1">
          Manage your organisation profile, team, and talent requests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="size-5" />
            <span className="text-small font-semibold uppercase tracking-wide">Verification Status</span>
          </div>
          {organisation && (
            <Badge variant={STATUS_VARIANT[organisation.status] ?? "neutral"}>{organisation.status_label}</Badge>
          )}
          {organisation?.status === "pending_verification" && (
            <p className="text-small text-muted-foreground">
              Your organisation is pending Result Seekers verification. You&apos;ll be notified once reviewed.
            </p>
          )}
        </Card>

        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ClipboardList className="size-5" />
            <span className="text-small font-semibold uppercase tracking-wide">Talent Requests</span>
          </div>
          <p className="text-h3 font-bold text-foreground">{requests.length}</p>
          <Button href="/organisation/dashboard/requests" variant="secondary" size="sm">
            View all requests
          </Button>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-h3 font-bold text-foreground">Recent Talent Requests</h2>
        <Button href="/organisation/dashboard/requests" size="sm">
          <Plus className="size-4 mr-1.5" />
          New Request
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No talent requests yet. Submit your first request to get started.
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.slice(0, 5).map((request) => (
            <Card key={request.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{request.title}</p>
                <p className="text-small text-muted-foreground">{request.reference}</p>
              </div>
              <Badge variant="outline">{request.status.replace(/_/g, " ")}</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
