"use client";

import { useCallback, useEffect, useState } from "react";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { searchRecruiterDatabase, type ExpertSearchResult, type AdminPaginatedResponse } from "@/lib/api/admin";

/**
 * RS-Recruiter-only professional discovery — organisations never reach
 * this page or its API. Foundation search only: filtered/paginated list
 * of the allowlist-shaped ExpertSearchResult. The matching/scoring engine
 * is a later phase.
 */
export default function AdminRecruiterSearchPage() {
  const [result, setResult] = useState<AdminPaginatedResponse<ExpertSearchResult> | null>(null);
  const [discipline, setDiscipline] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    searchRecruiterDatabase({ discipline: discipline || undefined, country: country || undefined })
      .then(setResult)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [discipline, country]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h2 text-foreground">Recruiter Search</h1>
        <p className="text-small text-muted-foreground mt-1">
          Search only returns experts who have opted into discoverable visibility. Organisations never see
          this list directly — Result Seekers curates and releases candidates through the managed
          recruitment process.
        </p>
      </div>

      <div className="mb-6 flex gap-3 max-w-xl">
        <Input placeholder="Discipline slug…" value={discipline} onChange={(e) => setDiscipline(e.target.value)} />
        <Input placeholder="Country…" value={country} onChange={(e) => setCountry(e.target.value)} />
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <ErrorState description="We couldn't load search results." retry={{ label: "Retry", onRetry: load }} />
      ) : !result || result.data.length === 0 ? (
        <EmptyState title="No matching professionals" description="No discoverable experts match these filters." />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Title</TableHeaderCell>
              <TableHeaderCell>Experience</TableHeaderCell>
              <TableHeaderCell>Location</TableHeaderCell>
              <TableHeaderCell>Disciplines</TableHeaderCell>
              <TableHeaderCell>Verification</TableHeaderCell>
              <TableHeaderCell>Visibility</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {result.data.map((expert) => (
              <TableRow key={expert.id}>
                <TableCell>{expert.professional_title ?? "—"}</TableCell>
                <TableCell>{expert.years_experience ?? "—"} yrs</TableCell>
                <TableCell>{[expert.state, expert.country].filter(Boolean).join(", ") || "—"}</TableCell>
                <TableCell>{expert.disciplines.join(", ") || "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="normal-case">
                    {expert.verification_level_label ?? "—"}
                  </Badge>
                </TableCell>
                <TableCell className="text-small text-muted-foreground">{expert.visibility_status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
