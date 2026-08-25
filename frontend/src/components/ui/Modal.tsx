"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** Optional — a confirm-only dialog (title + description + footer, no body) is a valid use. */
  children?: React.ReactNode;
  /** Rendered right-aligned below `children` — typically Cancel/Confirm buttons. */
  footer?: React.ReactNode;
}

/**
 * First modal/dialog in the project (Task 014 — delete confirmations, the
 * Media Library picker). Hand-rolled rather than a native <dialog> element
 * to keep full design-system styling control; focus moves to the panel on
 * open and Escape closes it, matching standard dialog expectations.
 */
export function Modal({ open, onClose, title, description, children, footer }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    panelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
            className="bg-foreground/50 absolute inset-0"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
            className="border-border bg-background rounded-card shadow-elevated relative flex max-h-[90vh] w-full max-w-lg flex-col border p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className="text-h4 text-foreground">
                  {title}
                </h2>
                {description && (
                  <p id={descriptionId} className="text-small text-muted-foreground mt-1">
                    {description}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close dialog"
                className="shrink-0 px-2"
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>

            {children && <div className="mt-4 overflow-y-auto">{children}</div>}

            {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
