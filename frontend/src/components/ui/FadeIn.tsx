"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  /** Optional delay in seconds — use for staggered card grids. */
  delay?: number;
  /** Slide direction on entrance. Defaults to "up". */
  direction?: "up" | "left" | "right" | "none";
  /** Animation duration in seconds. Defaults to 0.5. */
  duration?: number;
  className?: string;
}

const DIRECTION_OFFSET = {
  up: { y: 20, x: 0 },
  left: { y: 0, x: -20 },
  right: { y: 0, x: 20 },
  none: { y: 0, x: 0 },
} as const;

/**
 * Lightweight scroll-reveal wrapper using Framer Motion.
 *
 * Fades + slides children into view once when the element enters the
 * viewport. Uses `useReducedMotion()` to skip the animation entirely for
 * users who have enabled the prefers-reduced-motion OS setting — the
 * children render immediately at full opacity with no transform.
 *
 * Usage:
 *   <FadeIn delay={0.1}>
 *     <SolutionCard … />
 *   </FadeIn>
 */
export function FadeIn({
  children,
  delay = 0,
  direction = "up",
  duration = 0.5,
  className,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const prefersReducedMotion = useReducedMotion();

  const { y, x } = DIRECTION_OFFSET[direction];

  // Under reduced-motion, render statically — no transform, no opacity fade.
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y, x }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, y, x }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
