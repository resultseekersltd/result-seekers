import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type CheckboxProps = Omit<ComponentPropsWithoutRef<"input">, "type"> & {
  /** Marks the checkbox as invalid — pairs with a FormField error message. */
  invalid?: boolean;
};

/**
 * Accessible checkbox matching the Result Seekers design system.
 * Use inside a <FormField> with the label as children of a sibling <Label>.
 */
export function Checkbox({ className, invalid, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      aria-invalid={invalid || undefined}
      className={cn(
        // Size
        "size-4 shrink-0",
        // Shape / colour
        "rounded border border-border bg-background",
        "checked:bg-primary checked:border-primary",
        // Focus ring
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        // Invalid state
        invalid && "border-danger focus-visible:outline-danger",
        // Cursor
        "cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}
