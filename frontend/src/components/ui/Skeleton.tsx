import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Bare pulsing placeholder block — compose with width/height utility
 * classes at the call site to build skeleton card/text layouts. Respects
 * reduced-motion via Tailwind's built-in motion-reduce variant.
 */
export function Skeleton({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={cn("bg-muted animate-pulse rounded-md motion-reduce:animate-none", className)}
      {...props}
    />
  );
}
