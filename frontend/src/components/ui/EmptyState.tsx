import { Inbox, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
}

/**
 * "Where content is unavailable: explain why, guide users toward the next
 * action, never leave empty white space" — design doc §32. Used for e.g. a
 * Knowledge Centre filter with no matching articles.
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-card border-border bg-muted/50 flex flex-col items-center gap-3 border border-dashed px-6 py-16 text-center",
        className,
      )}
    >
      <Icon className="text-muted-foreground size-8" aria-hidden="true" />
      <p className="text-h4 text-foreground">{title}</p>
      {description && <p className="text-body text-muted-foreground max-w-sm">{description}</p>}
      {action && (
        <Button href={action.href} variant="secondary" size="sm" className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  );
}
