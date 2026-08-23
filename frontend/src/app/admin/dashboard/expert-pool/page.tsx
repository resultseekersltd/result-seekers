"use client";

import { useCallback, useEffect, useState } from "react";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { listExperts, type AdminExpert, type AdminPaginatedResponse } from "@/lib/api/admin";

const STATUS_VARIANT: Record<string, "neutral" | "primary" | "outline" | "success"> = {
  incomplete: "neutral",
  complete: "outline",
  submitted: "primary",
  under_review: "primary",
  approved: "success",
  rejected: "neutral",
  suspended: "neutral",
};

export default function AdminExpertPoolPage() {
  const [result, setResult] = useState<AdminPaginatedResponse<AdminExpert> | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    listExperts({ page, search: search || undefined })
      .then(setResult)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see audit-log/page.tsx's comment
    load();
  }, [load]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-h2 text-foreground">Expert Pool</h1>
        {result && <p className="text-small text-muted-foreground">{result.meta.total} experts</p>}
      </div>

      <Input
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="mb-6 max-w-sm"
      />

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <ErrorState description="We couldn't load the Expert Pool." retry={{ label: "Retry", onRetry: load }} />
      ) : !result || result.data.length === 0 ? (
        <EmptyState title="No experts found" description="No accounts match your search." />
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Completion</TableHeaderCell>
                <TableHeaderCell>Account</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {result.data.map((expert) => (
                <TableRow key={expert.id}>
                  <TableCell>{expert.name}</TableCell>
                  <TableCell>{expert.email}</TableCell>
                  <TableCell>
                    {expert.profile?.status ? (
                      <Badge variant={STATUS_VARIANT[expert.profile.status] ?? "neutral"} className="normal-case">
                        {expert.profile.status.replace(/_/g, " ")}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{expert.profile?.completion_percentage ?? 0}%</TableCell>
                  <TableCell>
                    <Badge variant={expert.is_active ? "success" : "neutral"}>
                      {expert.is_active ? "Active" : "Suspended"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" href={`/admin/dashboard/expert-pool/${expert.id}`}>
                      View
                    </Button>
                  </TableCell>
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
