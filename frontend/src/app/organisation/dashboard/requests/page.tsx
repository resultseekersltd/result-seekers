"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { getTalentRequests, createTalentRequest, OrganisationApiError } from "@/lib/api/organisation";
import type { TalentRequest } from "@/types/organisation";
import { ClipboardList, Plus, Loader2 } from "lucide-react";

const SERVICE_TYPES = [
  { value: "talent_hunt", label: "Talent Hunt" },
  { value: "managed_recruitment", label: "Managed Recruitment" },
  { value: "project_team", label: "Project Team Assembly" },
  { value: "rapid_deployment", label: "Rapid Field Deployment" },
  { value: "executive_search", label: "Executive & Specialist Search" },
  { value: "rpo", label: "Recruitment Process Outsourcing" },
];

export default function OrganisationRequestsPage() {
  const [requests, setRequests] = useState<TalentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [serviceType, setServiceType] = useState(SERVICE_TYPES[0].value);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [numberRequired, setNumberRequired] = useState(1);
  const [location, setLocation] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadRequests() {
    setLoading(true);
    getTalentRequests()
      .then((res) => setRequests(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see admin/dashboard/audit-log/page.tsx's comment
    loadRequests();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await createTalentRequest({
        service_type: serviceType,
        title,
        description,
        number_required: numberRequired,
        location: location || undefined,
        deadline: deadline || undefined,
      });
      setTitle("");
      setDescription("");
      setLocation("");
      setDeadline("");
      setNumberRequired(1);
      setShowForm(false);
      loadRequests();
    } catch (err) {
      if (err instanceof OrganisationApiError) setError(err.message);
      else setError("Failed to submit talent request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-bold tracking-tight text-foreground flex items-center gap-2">
            <ClipboardList className="size-6 text-primary" />
            Talent Requests
          </h1>
          <p className="text-body text-muted-foreground mt-1">
            Submit a request and the Result Seekers recruitment team will follow up. We manage sourcing,
            screening, and candidate consent — you review only authorised, curated results.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="size-4 mr-1.5" />
          New Request
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-input border border-danger/30 bg-danger/10 p-3 text-small text-danger">{error}</div>
            )}

            <FormField htmlFor="req-service-type" label="Service" required>
              <Select id="req-service-type" value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
                {SERVICE_TYPES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField htmlFor="req-title" label="Position / Assignment Title" required>
              <Input id="req-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField htmlFor="req-number" label="Number Required">
                <Input
                  id="req-number"
                  type="number"
                  min={1}
                  value={numberRequired}
                  onChange={(e) => setNumberRequired(Number(e.target.value))}
                />
              </FormField>
              <FormField htmlFor="req-location" label="Location">
                <Input id="req-location" value={location} onChange={(e) => setLocation(e.target.value)} />
              </FormField>
            </div>

            <FormField htmlFor="req-deadline" label="Deadline">
              <Input id="req-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </FormField>

            <FormField htmlFor="req-description" label="Description" required>
              <textarea
                id="req-description"
                className="w-full rounded-input border border-border bg-background p-3 text-body"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </FormField>

            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No talent requests yet"
          description="Submit your first request to start working with Result Seekers' recruitment team."
        />
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <Card key={request.id} className="p-4">
              <Link href={`/organisation/dashboard/requests/${request.id}`} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{request.title}</p>
                  <p className="text-small text-muted-foreground">
                    {request.reference} · {SERVICE_TYPES.find((s) => s.value === request.service_type)?.label ?? request.service_type}
                  </p>
                </div>
                <Badge variant="outline">{request.status.replace(/_/g, " ")}</Badge>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
