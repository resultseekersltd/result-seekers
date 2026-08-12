import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  /** Either a link (e.g. reload the page) or a client-side retry handler — pass whichever fits the caller. */
  retry?: { label: string; href: string } | { label: string; onRetry: () => void };
  className?: string;
}

/**
 * Inline error display for a failed data fetch within a page section —
 * distinct from Next.js's route-level error.tsx boundary (Task 012), which
 * catches unhandled render errors for a whole route instead.
 */
export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this content. Please try again.",
  retry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "rounded-card border-border bg-muted/50 flex flex-col items-center gap-3 border border-dashed px-6 py-16 text-center",
        className,
      )}
    >
      <AlertTriangle className="text-danger size-8" aria-hidden="true" />
      <p className="text-h4 text-foreground">{title}</p>
      <p className="text-body text-muted-foreground max-w-sm">{description}</p>
      {retry && "href" in retry && (
        <Button href={retry.href} variant="secondary" size="sm" className="mt-2">
          {retry.label}
        </Button>
      )}
      {retry && "onRetry" in retry && (
        <Button
          type="button"
          onClick={retry.onRetry}
          variant="secondary"
          size="sm"
          className="mt-2"
        >
          {retry.label}
        </Button>
      )}
    </div>
  );
}
