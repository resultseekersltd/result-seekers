import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { FIELD_BASE_CLASSES, FIELD_INVALID_CLASSES } from "@/components/ui/field-styles";

type TextareaProps = ComponentPropsWithoutRef<"textarea"> & {
  invalid?: boolean;
};

export function Textarea({ className, invalid, rows = 5, ...props }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(FIELD_BASE_CLASSES, "resize-y", invalid && FIELD_INVALID_CLASSES, className)}
      {...props}
    />
  );
}
