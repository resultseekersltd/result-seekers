import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent-hover",
  outline: "border border-border bg-transparent text-foreground",
  /** For positive/live status (e.g. Product status "Operational"). */
  success: "bg-success/10 text-success",
} as const;

export type BadgeVariant = keyof typeof VARIANTS;

type BadgeAsSpan = ComponentPropsWithoutRef<"span"> & {
  variant?: BadgeVariant;
  href?: undefined;
};

type BadgeAsLink = Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & {
  variant?: BadgeVariant;
  /** Renders the badge as a link instead of a <span> — e.g. Knowledge Centre category/tag filter chips. */
  href: string;
};

type BadgeProps = BadgeAsSpan | BadgeAsLink;

/**
 * Small pill label — status badges (radius per spec: 999px), eyebrow
 * kickers, tags. Renders as a <span> by default; pass `href` to render as
 * a clickable filter chip instead (same href-polymorphism pattern as
 * Button), without duplicating a second "chip" component.
 */
export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  const classes = cn(
    "rounded-badge text-caption inline-flex items-center px-3 py-1 font-semibold tracking-wide uppercase",
    VARIANTS[variant],
    props.href &&
      "transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    className,
  );

  if (props.href) {
    return <Link className={classes} {...(props as BadgeAsLink)} />;
  }

  return <span className={classes} {...(props as BadgeAsSpan)} />;
}
