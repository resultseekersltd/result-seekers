import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { FIELD_BASE_CLASSES, FIELD_INVALID_CLASSES } from "@/components/ui/field-styles";

type InputProps = ComponentPropsWithoutRef<"input"> & {
  /** Marks the field as invalid — red border/outline plus aria-invalid. Pair with a FormField error message. */
  invalid?: boolean;
};

export function Input({ className, invalid, ...props }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(FIELD_BASE_CLASSES, invalid && FIELD_INVALID_CLASSES, className)}
      {...props}
    />
  );
}
