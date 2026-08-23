"use client";

import { useCallback, useEffect, useState } from "react";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { listAuditLog, type AuditLogEntry, type AdminPaginatedResponse } from "@/lib/api/admin";

export default function AdminAuditLogPage() {
  const [result, setResult] = useState<AdminPaginatedResponse<AuditLogEntry> | null>(null);
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    listAuditLog({ page, action: action || undefined })
      .then(setResult)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [page, action]);

  useEffect(() => {
    // load() sets loading/error state synchronously before its fetch
    // resolves (needed so the spinner shows immediately on mount/retry) —
    // a deliberate, standard pattern, not an accidental cascading render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-h2 text-foreground">Audit Log</h1>
        {result && <p className="text-small text-muted-foreground">{result.meta.total} entries</p>}
      </div>

      <Input
        placeholder="Filter by action (e.g. solution.updated)…"
        value={action}
        onChange={(e) => {
          setAction(e.target.value);
          setPage(1);
        }}
        className="mb-6 max-w-sm"
      />

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <ErrorState description="We couldn't load the audit log." retry={{ label: "Retry", onRetry: load }} />
      ) : !result || result.data.length === 0 ? (
        <EmptyState title="No matching entries" description="Admin actions will appear here as they happen." />
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>When</TableHeaderCell>
                <TableHeaderCell>Actor</TableHeaderCell>
                <TableHeaderCell>Action</TableHeaderCell>
                <TableHeaderCell>Subject</TableHeaderCell>
                <TableHeaderCell>IP</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {result.data.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(entry.createdAt).toLocaleString("en-GB")}
                  </TableCell>
                  <TableCell>{entry.actorName ?? "System"}</TableCell>
                  <TableCell className="font-mono text-caption">{entry.action}</TableCell>
                  <TableCell>
                    {entry.subjectLabel ? `${entry.subjectType}: ${entry.subjectLabel}` : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{entry.ipAddress ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {result.meta.last_page > 1 && (
            <div className="mt-6 flex items-center justify-between gap-4">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={result.meta.current_page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
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
