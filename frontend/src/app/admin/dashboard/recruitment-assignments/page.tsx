"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { listRecruitmentAssignments, type AdminPaginatedResponse, type RecruitmentAssignment } from "@/lib/api/admin";
import { Workflow } from "lucide-react";

const STATUS_VARIANT: Record<string, "neutral" | "accent" | "success" | "outline"> = {
  opened: "accent",
  completed: "success",
  cancelled: "neutral",
  archived: "neutral",
};

export default function RecruitmentAssignmentsPage() {
  const [result, setResult] = useState<AdminPaginatedResponse<RecruitmentAssignment> | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    listRecruitmentAssignments({ status: status || undefined })
      .then(setResult)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-h2 text-foreground flex items-center gap-2">
            <Workflow className="size-6 text-primary" />
            Recruitment Assignments
          </h1>
          <p className="text-small text-muted-foreground mt-1">
            Each assignment tracks one talent request&apos;s candidate pipeline — from sourcing through screening,
            quality review, and controlled release. Open one from a Talent Request&apos;s detail page.
          </p>
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-xs">
          <option value="">All statuses</option>
          <option value="opened">Opened</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="archived">Archived</option>
        </Select>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <ErrorState description="We couldn't load recruitment assignments." retry={{ label: "Retry", onRetry: load }} />
      ) : !result || result.data.length === 0 ? (
        <EmptyState
          icon={Workflow}
          title="No recruitment assignments yet"
          description="Open one from a submitted talent request to start building a candidate pipeline."
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Reference</TableHeaderCell>
              <TableHeaderCell>Talent Request</TableHeaderCell>
              <TableHeaderCell>Organisation</TableHeaderCell>
              <TableHeaderCell>Recruiter</TableHeaderCell>
              <TableHeaderCell>Pipeline</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {result.data.map((a) => (
              <TableRow key={a.id}>
                <TableCell>
                  <Link href={`/admin/dashboard/recruitment-assignments/${a.id}`} className="font-mono text-primary hover:underline">
                    {a.reference ?? a.id}
                  </Link>
                </TableCell>
                <TableCell>{a.talent_request_title ?? "—"}</TableCell>
                <TableCell>{a.organisation_name ?? "—"}</TableCell>
                <TableCell>{a.recruiter_name ?? "—"}</TableCell>
                <TableCell>{a.pipeline_count ?? 0}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[a.status] ?? "outline"} className="normal-case">
                    {a.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
