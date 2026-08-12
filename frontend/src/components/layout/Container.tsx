import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/utils";

type ContainerProps<T extends ElementType> = {
  /** Element/component to render as. Defaults to `div`. */
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/**
 * Horizontally centers content and caps it at the design system's max
 * content width (1280px), with mobile-first gutter padding.
 */
export function Container<T extends ElementType = "div">({
  as,
  className,
  ...props
}: ContainerProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={cn("mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}
