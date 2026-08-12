import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PaginationProps {
  /** Laravel's paginated response uses these exact field names under `meta` (see e.g. GET /api/articles). */
  currentPage: number;
  lastPage: number;
  /** Builds the frontend URL for a given page — the API's own `links.next`/`links.prev` point at API URLs, not frontend routes. */
  getHref: (page: number) => string;
}

/** Simple prev/next pagination — used by Knowledge Centre and Academy listings (Task 009). */
export function Pagination({ currentPage, lastPage, getHref }: PaginationProps) {
  if (lastPage <= 1) return null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < lastPage;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4">
      <Button
        href={getHref(currentPage - 1)}
        variant="secondary"
        size="sm"
        aria-disabled={!hasPrev}
        className={!hasPrev ? "pointer-events-none opacity-50" : undefined}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Previous
      </Button>

      <p className="text-small text-muted-foreground">
        Page {currentPage} of {lastPage}
      </p>

      <Button
        href={getHref(currentPage + 1)}
        variant="secondary"
        size="sm"
        aria-disabled={!hasNext}
        className={!hasNext ? "pointer-events-none opacity-50" : undefined}
      >
        Next
        <ChevronRight className="size-4" aria-hidden="true" />
      </Button>
    </nav>
  );
}
