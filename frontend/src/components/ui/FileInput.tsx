"use client";

import { useRef, type ComponentPropsWithoutRef } from "react";
import { Upload, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type FileInputProps = Omit<ComponentPropsWithoutRef<"input">, "type"> & {
  /** Human-readable label shown in the drop zone (e.g. "Upload CV"). */
  label?: string;
  /** Helper text below the label (e.g. "PDF, DOC or DOCX · Max 10 MB"). */
  description?: string;
  /** Currently selected file name to display. */
  fileName?: string;
  /** Called when the user clears the selection. */
  onClear?: () => void;
  invalid?: boolean;
};

/**
 * Drag-and-drop / click file input for CV uploads.
 * The hidden <input type="file"> is wired through a visible drop zone so
 * the design stays consistent without relying on the browser's default
 * file-picker styling.
 */
export function FileInput({
  label = "Upload file",
  description,
  fileName,
  onClear,
  invalid,
  className,
  ...props
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn("w-full", className)}>
      {fileName ? (
        // File selected state
        <div className="flex items-center justify-between gap-3 rounded-card border border-border bg-muted px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <span className="text-small text-foreground truncate font-medium">{fileName}</span>
          </div>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Remove selected file"
              className="text-muted-foreground hover:text-danger shrink-0 transition-colors"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      ) : (
        // Empty drop-zone
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label={label}
          className={cn(
            "w-full rounded-card border-2 border-dashed border-border bg-muted/50",
            "flex flex-col items-center gap-2 px-6 py-8",
            "text-muted-foreground transition-colors",
            "hover:border-primary hover:bg-muted hover:text-primary",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            invalid && "border-danger",
          )}
        >
          <Upload className="size-8" aria-hidden="true" />
          <span className="text-body font-medium">{label}</span>
          {description && (
            <span className="text-small text-muted-foreground">{description}</span>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        aria-invalid={invalid || undefined}
        {...props}
      />
    </div>
  );
}
