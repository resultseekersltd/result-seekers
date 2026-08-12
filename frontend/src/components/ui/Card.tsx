import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/utils";

type CardProps<T extends ElementType> = {
  as?: T;
  /** Adds hover elevation — use for clickable cards (product/solution/insight cards). */
  hoverable?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/**
 * Base container for the card-based components the design system doc calls
 * for (Product/Solution/Insight/Team/Stat cards, §15/26-28): 16px radius,
 * soft resting shadow, elevated on hover — "elevated, not detached".
 */
export function Card<T extends ElementType = "div">({
  as,
  hoverable = false,
  className,
  ...props
}: CardProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={cn(
        "rounded-card border-border bg-background shadow-soft border p-6",
        hoverable &&
          "hover:shadow-elevated hover:-translate-y-0.5 transition-[shadow,transform] duration-200",
        className,
      )}
      {...props}
    />
  );
}
