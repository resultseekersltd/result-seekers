import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Pulled forward from Task 003 (Reusable UI Component Library) because the
 * Task 002 Navbar and CTA Section both need a button — Task 003 will reuse
 * this, not replace it.
 *
 * Variants/sizes per 02_UI_UX_and_Design_System.md §16.
 */
const VARIANTS = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondary: "border border-primary bg-transparent text-primary hover:bg-muted",
  ghost: "bg-transparent text-foreground hover:bg-muted",
  link: "bg-transparent p-0! text-primary underline-offset-4 hover:underline",
  /** Not one of the doc's 4 named variants — needed for buttons placed on
   * the brand-purple CTA band (primary/ghost read as invisible there). */
  inverse: "bg-neutral-white text-primary hover:bg-neutral-white/90",
} as const;

const SIZES = {
  sm: "px-4 py-2 text-small",
  md: "px-6 py-3 text-body",
  lg: "px-8 py-3 text-body-lg",
  xl: "px-12 py-4 text-body-lg",
} as const;

export type ButtonVariant = keyof typeof VARIANTS;
export type ButtonSize = keyof typeof SIZES;

interface SharedProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = SharedProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof SharedProps> & {
    href?: undefined;
  };

type ButtonAsLink = SharedProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, keyof SharedProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-button font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50";

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  // The "link" variant's `p-0!` (see VARIANTS) always wins over the size's
  // padding — Tailwind's trailing "!" applies `!important` regardless of
  // class order — so SIZES can be applied unconditionally here.
  const classes = cn(BASE_CLASSES, VARIANTS[variant], SIZES[size], className);

  if (props.href) {
    return (
      <Link className={classes} {...(props as ButtonAsLink)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(props as ButtonAsButton)}>
      {children}
    </button>
  );
}
