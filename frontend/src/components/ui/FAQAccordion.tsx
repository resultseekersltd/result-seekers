"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface FAQItem {
  question: string;
  answer: string;
}

/** Single-open accordion for FAQ lists. Data-agnostic — accepts items as props, no assumption about where they come from. */
export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const baseId = useId();

  return (
    <div className="divide-border rounded-card border-border divide-y border">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;

        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
            >
              <span className="text-body-lg text-foreground font-medium">{item.question}</span>
              <ChevronDown
                className={cn(
                  "text-muted-foreground size-5 shrink-0 transition-transform",
                  isOpen && "rotate-180",
                )}
                aria-hidden="true"
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="text-body text-muted-foreground px-6 pb-4">{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
