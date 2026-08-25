"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  addVerificationCheck,
  createVerificationCase,
  listVerificationCases,
  updateVerificationCheck,
  type AdminPaginatedResponse,
  type VerificationCase,
} from "@/lib/api/admin";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";

/**
 * Case opening/check management now goes through the UI (Phase 3) — the
 * previous "checks are reviewed via the API directly" limitation is
 * resolved here.
 */
export default function AdminVerificationPage() {
  const [result, setResult] = useState<AdminPaginatedResponse<VerificationCase> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [showNewCase, setShowNewCase] = useState(false);
  const [profileId, setProfileId] = useState("");
  const [targetLevel, setTargetLevel] = useState("");
  const [creatingCase, setCreatingCase] = useState(false);

  const [checkType, setCheckType] = useState<Record<string, string>>({});

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    listVerificationCases()
      .then(setResult)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleCreateCase(e: React.FormEvent) {
    e.preventDefault();
    setCreatingCase(true);
    try {
      await createVerificationCase({
        expert_pool_profile_id: Number(profileId),
        target_level: targetLevel || undefined,
      });
      setProfileId("");
      setTargetLevel("");
      setShowNewCase(false);
      load();
    } finally {
      setCreatingCase(false);
    }
  }

  async function handleAddCheck(caseId: string) {
    const type = checkType[caseId]?.trim();
    if (!type) return;
    await addVerificationCheck(caseId, { check_type: type });
    setCheckType((prev) => ({ ...prev, [caseId]: "" }));
    load();
  }

  async function handleCheckStatus(caseId: string, checkId: string, status: string) {
    await updateVerificationCheck(caseId, checkId, { status });
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-h2 text-foreground">Verification Cases</h1>
          <p className="text-small text-muted-foreground mt-1">
            Each case tracks an expert&apos;s progress through the verification levels. Individual checks are
            reviewed and approved by the Verifier role.
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setShowNewCase(!showNewCase)}>
          <Plus className="size-4 mr-1.5" /> Open Case
        </Button>
      </div>

      {showNewCase && (
        <Card className="p-6 mb-6 max-w-lg">
          <form onSubmit={handleCreateCase} className="space-y-3">
            <Input
              type="number"
              placeholder="Expert Pool Profile ID"
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              required
            />
            <Input placeholder="Target level (optional)" value={targetLevel} onChange={(e) => setTargetLevel(e.target.value)} />
            <Button type="submit" size="sm" disabled={creatingCase || !profileId.trim()}>
              Open Case
            </Button>
          </form>
        </Card>
      )}

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <ErrorState description="We couldn't load verification cases." retry={{ label: "Retry", onRetry: load }} />
      ) : !result || result.data.length === 0 ? (
        <EmptyState title="No verification cases yet" description="Cases appear here once opened for an expert." />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Expert</TableHeaderCell>
              <TableHeaderCell>Target Level</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Checks</TableHeaderCell>
              <TableHeaderCell className="text-right">Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {result.data.map((c) => (
              <Fragment key={c.id}>
                <TableRow>
                  <TableCell>{c.expert_name ?? "—"}</TableCell>
                  <TableCell className="normal-case">{c.target_level?.replace(/_/g, " ") ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="normal-case">
                      {c.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{c.checks.length}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                      {expandedId === c.id ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
                {expandedId === c.id && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="space-y-3 py-2">
                        {c.checks.map((check) => (
                          <div key={check.id} className="flex items-center justify-between rounded-card border border-border p-3">
                            <div>
                              <p className="text-small font-medium text-foreground normal-case">{check.check_type}</p>
                              <p className="text-caption text-muted-foreground">{check.status.replace(/_/g, " ")}</p>
                            </div>
                            <Select
                              value=""
                              onChange={(e) => e.target.value && handleCheckStatus(c.id, check.id, e.target.value)}
                              className="w-56"
                            >
                              <option value="">Update status…</option>
                              <option value="under_review">Under Review</option>
                              <option value="clarification_requested">Clarification Requested</option>
                              <option value="verified">Verified</option>
                              <option value="partially_verified">Partially Verified</option>
                              <option value="unable_to_verify">Unable to Verify</option>
                              <option value="rejected">Rejected</option>
                            </Select>
                          </div>
                        ))}

                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Check type (e.g. identity, degree, employer)"
                            value={checkType[c.id] ?? ""}
                            onChange={(e) => setCheckType((prev) => ({ ...prev, [c.id]: e.target.value }))}
                            className="max-w-xs"
                          />
                          <Button size="sm" variant="secondary" onClick={() => handleAddCheck(c.id)}>
                            <Plus className="size-4 mr-1.5" /> Add Check
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
