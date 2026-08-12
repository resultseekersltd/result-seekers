import type { ComponentPropsWithoutRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FIELD_BASE_CLASSES, FIELD_INVALID_CLASSES } from "@/components/ui/field-styles";

type SelectProps = ComponentPropsWithoutRef<"select"> & {
  invalid?: boolean;
};

/**
 * A styled native <select>, not a custom listbox — native selects are
 * fully keyboard/screen-reader accessible for free (correct semantics,
 * OS-native option list) and a custom widget would only add complexity
 * without a concrete requirement for it.
 */
export function Select({ className, invalid, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        aria-invalid={invalid || undefined}
        className={cn(
          FIELD_BASE_CLASSES,
          "appearance-none pr-10",
          invalid && FIELD_INVALID_CLASSES,
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
        aria-hidden="true"
      />
    </div>
  );
}
