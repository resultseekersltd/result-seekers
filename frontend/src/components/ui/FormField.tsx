import type { ReactNode } from "react";
import { Label } from "@/components/ui/Label";

interface FormFieldProps {
  /** Must match the id of the input/textarea/select passed as children. */
  htmlFor: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

/**
 * Composes Label + field + helper/error text with the right accessible
 * wiring (the field itself — Input/Textarea/Select — is passed as
 * children so this stays form-library agnostic; Task 010 wires these up
 * with React Hook Form + Zod).
 */
export function FormField({
  htmlFor,
  label,
  description,
  error,
  required,
  children,
}: FormFieldProps) {
  const descriptionId = description ? `${htmlFor}-description` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor}>
        {label}
        {required && (
          <span className="text-danger" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </Label>
      {children}
      {description && !error && (
        <p id={descriptionId} className="text-small text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-small text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
