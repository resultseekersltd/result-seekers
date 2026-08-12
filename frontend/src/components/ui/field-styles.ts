/**
 * Shared base classes for Input/Textarea/Select so the three don't each
 * redefine the same border/focus/invalid/disabled treatment.
 */
export const FIELD_BASE_CLASSES =
  "w-full rounded-input border border-border bg-background px-4 py-2.5 text-body text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60";

export const FIELD_INVALID_CLASSES = "border-danger focus-visible:outline-danger";
