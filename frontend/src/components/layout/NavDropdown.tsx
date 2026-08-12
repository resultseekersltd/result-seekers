"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface NavDropdownItem {
  label: string;
  href: string;
}

interface NavDropdownProps {
  label: string;
  /** "View all" link, and the fallback target when there's nothing to show yet. */
  href: string;
  items: NavDropdownItem[];
}

const TRIGGER_CLASSES =
  "flex items-center gap-1 rounded-md px-3 py-2 text-small font-medium text-foreground transition-colors hover:text-primary";

/**
 * Desktop dropdown for Solutions/Products. Degrades gracefully: while the
 * backend API isn't reachable yet (or genuinely has no rows), `items` is
 * empty and this renders as a plain link instead of a broken/empty menu —
 * it upgrades to a full dropdown automatically once the API returns data.
 */
export function NavDropdown({ label, href, items }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (items.length === 0) {
    return (
      <Link href={href} className={TRIGGER_CLASSES}>
        {label}
      </Link>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={TRIGGER_CLASSES}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
      >
        {label}
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="menu"
            aria-label={label}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -4 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
            className="rounded-card border-border bg-background shadow-elevated absolute top-full left-0 z-50 mt-2 w-72 border p-2"
          >
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                className="text-small text-foreground hover:bg-muted block rounded-md px-3 py-2"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={href}
              role="menuitem"
              className="text-small text-primary hover:bg-muted mt-1 block rounded-md px-3 py-2 font-semibold"
              onClick={() => setOpen(false)}
            >
              View all {label}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
