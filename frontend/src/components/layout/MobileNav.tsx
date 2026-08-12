"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";
import { primaryCta, primaryNavLinks } from "@/config/navigation";
import type { NavDropdownItem } from "@/components/layout/NavDropdown";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  solutions: NavDropdownItem[];
  products: NavDropdownItem[];
}

/** [Home, About] before the Solutions/Products dropdown slots, per the nav order in the spec. */
const LINKS_BEFORE_DROPDOWNS = primaryNavLinks.slice(0, 2);
const LINKS_AFTER_DROPDOWNS = primaryNavLinks.slice(2);

export function MobileNav({ open, onClose, solutions, products }: MobileNavProps) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="bg-neutral-near-black/40 fixed inset-0 z-40 md:hidden"
            aria-hidden="true"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          />
          <motion.div
            id="mobile-nav-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="bg-background shadow-elevated fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col overflow-y-auto p-6 md:hidden"
            initial={{ x: prefersReducedMotion ? 0 : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: prefersReducedMotion ? 0 : "100%" }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="text-foreground hover:bg-muted rounded-md p-2"
              >
                <X className="size-6" aria-hidden="true" />
              </button>
            </div>

            <nav className="mt-8 flex flex-1 flex-col gap-1">
              {LINKS_BEFORE_DROPDOWNS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="text-body-lg text-foreground hover:bg-muted rounded-md px-3 py-3 font-medium"
                >
                  {link.label}
                </Link>
              ))}

              <MobileNavSection
                label="Solutions"
                href="/solutions"
                items={solutions}
                onNavigate={onClose}
              />
              <MobileNavSection
                label="Products"
                href="/products"
                items={products}
                onNavigate={onClose}
              />

              {LINKS_AFTER_DROPDOWNS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="text-body-lg text-foreground hover:bg-muted rounded-md px-3 py-3 font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Button href={primaryCta.href} onClick={onClose} className="mt-6 justify-center">
              {primaryCta.label}
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MobileNavSection({
  label,
  href,
  items,
  onNavigate,
}: {
  label: string;
  href: string;
  items: NavDropdownItem[];
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className="text-body-lg text-foreground hover:bg-muted rounded-md px-3 py-3 font-medium"
      >
        {label}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="text-body-lg text-foreground hover:bg-muted flex w-full items-center justify-between rounded-md px-3 py-3 font-medium"
      >
        {label}
        <ChevronDown
          className={cn("size-5 transition-transform", expanded && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {expanded && (
        <div className="border-border ml-3 flex flex-col gap-1 border-l pl-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="text-body text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-3 py-2"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={href}
            onClick={onNavigate}
            className="text-small text-primary hover:bg-muted rounded-md px-3 py-2 font-semibold"
          >
            View all {label}
          </Link>
        </div>
      )}
    </div>
  );
}
