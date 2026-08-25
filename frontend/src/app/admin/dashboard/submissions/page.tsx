"use client";

import { useCallback, useEffect, useState } from "react";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import {
  listSubmissions,
  updateSubmission,
  type SubmissionKind,
  type LaravelPaginated,
} from "@/lib/api/admin";

interface Tab {
  kind: SubmissionKind;
  label: string;
  statusOptions?: string[];
}

const TABS: Tab[] = [
  { kind: "contact-submissions", label: "Contact", statusOptions: ["new", "in_progress", "responded", "closed"] },
  { kind: "consultation-bookings", label: "Consultations", statusOptions: ["new", "confirmed", "completed", "cancelled"] },
  { kind: "job-applications", label: "Job Applications", statusOptions: ["new", "shortlisted", "interviewing", "rejected", "hired"] },
  { kind: "newsletter-subscribers", label: "Newsletter" },
];

// Every kind's rows are raw Eloquent JSON (snake_case) from
// Api\Admin\AdminSubmissionsController — not the camelCase API Resources
// used elsewhere, since that controller predates this task and serializes
// models directly.
interface SubmissionRow {
  id: number;
  status?: string;
  full_name?: string;
  applicant_name?: string;
  email: string;
  type?: string;
  message?: string;
  created_at: string;
}

export default function AdminSubmissionsPage() {
  const [activeTab, setActiveTab] = useState<Tab>(TABS[0]);
  const [result, setResult] = useState<LaravelPaginated<SubmissionRow> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    listSubmissions<SubmissionRow>(activeTab.kind)
      .then(setResult)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [activeTab]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see audit-log/page.tsx's comment
    load();
  }, [load]);

  async function handleStatusChange(id: number, status: string) {
    if (activeTab.kind === "newsletter-subscribers") return;
    setUpdatingId(id);
    try {
      await updateSubmission(activeTab.kind, id, { status });
      load();
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <h1 className="text-h2 text-foreground mb-6">Submissions</h1>

      <div className="border-border mb-6 flex gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.kind}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "text-small -mb-px border-b-2 px-4 py-2.5 font-medium transition-colors",
              activeTab.kind === tab.kind
                ? "border-primary text-primary"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <ErrorState description="We couldn't load submissions." retry={{ label: "Retry", onRetry: load }} />
      ) : !result || result.data.length === 0 ? (
        <EmptyState title="Nothing here yet" description="Submissions will appear here as they come in." />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Name / Email</TableHeaderCell>
              <TableHeaderCell>Details</TableHeaderCell>
              <TableHeaderCell>Received</TableHeaderCell>
              {activeTab.statusOptions && <TableHeaderCell>Status</TableHeaderCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {result.data.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="font-medium">{row.full_name ?? row.applicant_name ?? row.email}</div>
                  <div className="text-muted-foreground text-small">{row.email}</div>
                </TableCell>
                <TableCell className="max-w-xs truncate">{row.message ?? row.type ?? "—"}</TableCell>
                <TableCell>{new Date(row.created_at).toLocaleDateString("en-GB")}</TableCell>
                {activeTab.statusOptions && (
                  <TableCell>
                    <Select
                      value={row.status}
                      disabled={updatingId === row.id}
                      onChange={(e) => handleStatusChange(row.id, e.target.value)}
                      className="w-auto"
                    >
                      {activeTab.statusOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt.replace(/_/g, " ")}
                        </option>
                      ))}
                    </Select>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
