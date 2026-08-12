import type { Solution } from "@/types/solution";

/**
 * Mirrors the `products` API resource (backend: app/Models/Product.php,
 * app/Enums/ProductStatus.php, app/Http/Resources/ProductResource.php).
 *
 * `description`/`targetUsers`/`features`/`logoPath`/`solutions` are only
 * ever populated by GET /api/products/{slug} (the index endpoint doesn't
 * send them — ProductCard only needs the Pick<> subset it already uses).
 * As of Task 007, `features` and `logoPath` are `null` for all seven
 * seeded products — no product has approved feature-list or logo content
 * yet (see Task 007 report) — so both are typed nullable, never assumed
 * present.
 */
export type ProductStatus = "operational" | "under_development" | "concept" | "coming_soon";

export interface Product {
  id: number;
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  status: ProductStatus;
  externalUrl: string | null;
  targetUsers: string[] | null;
  features: string[] | null;
  logoPath: string | null;
  order: number;
  solutions?: Solution[];
}
