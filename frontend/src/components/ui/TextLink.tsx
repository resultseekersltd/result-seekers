import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type TextLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  /** Appends an arrow icon — used for "Learn More" style links on cards. */
  withArrow?: boolean;
};

/**
 * Inline/prose link styling (card "Learn More", body copy links) —
 * distinct from Button's "link" variant, which is sized/padded to sit in a
 * button group. This has no padding and is meant to flow inline with text.
 */
export function TextLink({ withArrow, className, children, ...props }: TextLinkProps) {
  return (
    <Link
      className={cn(
        "text-small text-primary inline-flex items-center gap-1 font-semibold underline-offset-4 hover:underline",
        className,
      )}
      {...props}
    >
      {children}
      {withArrow && <ArrowRight className="size-4" aria-hidden="true" />}
    </Link>
  );
}
