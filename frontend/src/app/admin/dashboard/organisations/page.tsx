"use client";

import { useCallback, useEffect, useState } from "react";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { listOrganisations, type AdminOrganisation, type AdminPaginatedResponse } from "@/lib/api/admin";

const STATUS_VARIANT: Record<string, "neutral" | "primary" | "outline" | "success"> = {
  draft: "neutral",
  pending_verification: "primary",
  clarification_requested: "primary",
  verified: "success",
  rejected: "outline",
  suspended: "outline",
  restricted: "outline",
  archived: "neutral",
};

export default function AdminOrganisationsPage() {
  const [result, setResult] = useState<AdminPaginatedResponse<AdminOrganisation> | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    listOrganisations({ page, search: search || undefined, status: status || undefined })
      .then(setResult)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [page, search, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-h2 text-foreground">Organisations</h1>
        {result && <p className="text-small text-muted-foreground">{result.meta.total} organisations</p>}
      </div>

      <div className="mb-6 flex gap-3 max-w-xl">
        <Input
          placeholder="Search by name…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="pending_verification">Pending Verification</option>
          <option value="clarification_requested">Clarification Requested</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
          <option value="restricted">Restricted</option>
          <option value="archived">Archived</option>
        </Select>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <ErrorState description="We couldn't load organisations." retry={{ label: "Retry", onRetry: load }} />
      ) : !result || result.data.length === 0 ? (
        <EmptyState title="No organisations found" description="No organisations match your search." />
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Country</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Users</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {result.data.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>{org.name}</TableCell>
                  <TableCell>{org.country ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[org.status] ?? "neutral"} className="normal-case">
                      {org.status_label}
                    </Badge>
                  </TableCell>
                  <TableCell>{org.users_count ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" href={`/admin/dashboard/organisations/${org.id}`}>
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
