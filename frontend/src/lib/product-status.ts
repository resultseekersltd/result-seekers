import type { BadgeVariant } from "@/components/ui/Badge";
import type { ProductStatus } from "@/types/product";

/**
 * Labels match backend ProductStatus::label() exactly
 * (app/Enums/ProductStatus.php) — keep the two in sync if either changes.
 */
export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  operational: "Operational",
  under_development: "Under Active Development",
  concept: "Concept / Under Development",
  coming_soon: "Coming Soon",
};

export const PRODUCT_STATUS_BADGE_VARIANTS: Record<ProductStatus, BadgeVariant> = {
  operational: "success",
  under_development: "primary",
  concept: "outline",
  coming_soon: "neutral",
};
