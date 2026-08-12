import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/Container";

/**
 * Every value here must come from the approved spacing scale (4/8/12/16/
 * 24/32/48/64/80/96/128px — see tokens.css). Revised down from the
 * original compact=48/64, default=64/96: two adjacent "default" sections
 * were compounding to 128-192px of dead space between their content,
 * which read as unintentional gaps rather than deliberate rhythm.
 */
const SPACING = {
  none: "",
  /** 32px → 48px — lightweight bands (stat strips, dense card grids that don't need much air). */
  compact: "py-8 md:py-12",
  /** 48px → 64px — the default for most content sections. */
  default: "py-12 md:py-16",
  /** 64px → 96px — reserved for sections that genuinely warrant extra presence (e.g. a hero). */
  spacious: "py-16 md:py-24",
} as const;

const TONE = {
  default: "bg-background",
  muted: "bg-muted",
  /**
   * The brand-purple CTA band. Added so CTASection can select it through
   * the same deterministic `tone` prop instead of appending `bg-primary`
   * via `className` — that pattern left two background utilities
   * (`bg-background` from TONE.default + `bg-primary` from className) on
   * the same element, with which one painted determined by Tailwind's
   * internal generation order rather than anything explicit.
   */
  primary: "bg-primary text-primary-foreground",
} as const;

type SectionProps = ComponentPropsWithoutRef<"section"> & {
  /** Vertical rhythm for this section. Defaults to "default" (48px → 64px). */
  spacing?: keyof typeof SPACING;
  /** Background tone, used to alternate section rhythm down a page. */
  tone?: keyof typeof TONE;
  /** Wrap children in the max-width Container. Set false to manage width yourself. */
  container?: boolean;
};

/**
 * Establishes the consistent vertical rhythm and background tone every page
 * section should share, per the "Section Standards" rules in the design
 * system doc. Composes Container internally so callers don't have to nest
 * <Container> manually in the common case.
 */
export function Section({
  spacing = "default",
  tone = "default",
  container = true,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn(SPACING[spacing], TONE[tone], className)} {...props}>
      {container ? <Container>{children}</Container> : children}
    </section>
  );
}
