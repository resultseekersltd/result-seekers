"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronDown, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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

const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

const LINKS_BEFORE_DROPDOWNS = primaryNavLinks.slice(0, 2);
const LINKS_AFTER_DROPDOWNS = primaryNavLinks.slice(2);

export function MobileNav({ open, onClose, solutions, products }: MobileNavProps) {
  const isClient = useIsClient();

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

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="md:hidden">
          {/* Backdrop overlay */}
          <motion.div
            className="bg-neutral-near-black/60 fixed inset-0 z-[998] backdrop-blur-xs"
            aria-hidden="true"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Drawer container */}
          <motion.div
            id="mobile-nav-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="bg-background shadow-2xl fixed inset-y-0 right-0 z-[999] flex w-full max-w-xs sm:max-w-sm flex-col overflow-y-auto p-6"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <Logo />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="text-foreground hover:bg-muted focus:outline-hidden focus:ring-2 focus:ring-primary rounded-lg p-2 transition-colors cursor-pointer"
              >
                <X className="size-6" aria-hidden="true" />
              </button>
            </div>

            <nav className="mt-6 flex flex-1 flex-col gap-1.5">
              {LINKS_BEFORE_DROPDOWNS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="text-body-lg text-foreground hover:bg-muted rounded-lg px-3 py-2.5 font-medium transition-colors"
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
                  className="text-body-lg text-foreground hover:bg-muted rounded-lg px-3 py-2.5 font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-8 border-t border-border/50 pt-4">
              <Button href={primaryCta.href} onClick={onClose} className="w-full justify-center shadow-md">
                {primaryCta.label}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
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
        className="text-body-lg text-foreground hover:bg-muted rounded-lg px-3 py-2.5 font-medium transition-colors"
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
        className="text-body-lg text-foreground hover:bg-muted flex w-full items-center justify-between rounded-lg px-3 py-2.5 font-medium transition-colors cursor-pointer"
      >
        {label}
        <ChevronDown
          className={cn("size-5 transition-transform duration-200 text-muted-foreground", expanded && "rotate-180 text-primary")}
          aria-hidden="true"
        />
      </button>
      {expanded && (
        <div className="border-border/60 ml-3 mt-1 flex flex-col gap-1 border-l pl-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="text-small text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-3 py-2 transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={href}
            onClick={onNavigate}
            className="text-small text-primary hover:bg-muted rounded-md px-3 py-2 font-semibold transition-colors"
          >
            View all {label} →
          </Link>
        </div>
      )}
    </div>
  );
}
