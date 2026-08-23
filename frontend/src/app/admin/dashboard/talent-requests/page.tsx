"use client";

import { useCallback, useEffect, useState } from "react";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { listTalentRequests, type AdminTalentRequest, type AdminPaginatedResponse } from "@/lib/api/admin";

const STATUS_VARIANT: Record<string, "neutral" | "primary" | "outline" | "success"> = {
  draft: "neutral",
  submitted: "primary",
  under_review: "primary",
  clarification_requested: "outline",
  assigned: "outline",
  in_recruitment: "primary",
  completed: "success",
  cancelled: "neutral",
};

export default function AdminTalentRequestsPage() {
  const [result, setResult] = useState<AdminPaginatedResponse<AdminTalentRequest> | null>(null);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    listTalentRequests({ page, status: status || undefined })
      .then(setResult)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [page, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-h2 text-foreground">Talent Requests</h1>
        {result && <p className="text-small text-muted-foreground">{result.meta.total} requests</p>}
      </div>

      <Select
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          setPage(1);
        }}
        className="mb-6 max-w-xs"
      >
        <option value="">All statuses</option>
        <option value="draft">Draft</option>
        <option value="submitted">Submitted</option>
        <option value="under_review">Under Review</option>
        <option value="clarification_requested">Clarification Requested</option>
        <option value="assigned">Assigned</option>
        <option value="in_recruitment">In Recruitment</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </Select>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <ErrorState description="We couldn't load talent requests." retry={{ label: "Retry", onRetry: load }} />
      ) : !result || result.data.length === 0 ? (
        <EmptyState title="No talent requests found" description="No organisation has submitted a request yet." />
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Reference</TableHeaderCell>
                <TableHeaderCell>Title</TableHeaderCell>
                <TableHeaderCell>Organisation</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {result.data.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-mono text-xs">{req.reference}</TableCell>
                  <TableCell>{req.title}</TableCell>
                  <TableCell>{req.organisation_name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[req.status] ?? "neutral"} className="normal-case">
                      {req.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" href={`/admin/dashboard/talent-requests/${req.id}`}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {result.meta.last_page > 1 && (
            <div className="mt-6 flex items-center justify-between gap-4">
              <Button type="button" variant="secondary" size="sm" disabled={result.meta.current_page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <p className="text-small text-muted-foreground">
                Page {result.meta.current_page} of {result.meta.last_page}
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={result.meta.current_page >= result.meta.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
