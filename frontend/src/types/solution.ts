import type { Product } from "@/types/product";
import type { Article } from "@/types/article";

/**
 * Mirrors the `solutions` API resource (backend: app/Models/Solution.php,
 * app/Http/Resources/SolutionResource.php).
 *
 * `heroHeading`/`heroDescription`/`problemStatement`/`ourApproach`/
 * `outputs`/`tools`/`icon` are `null` for all six seeded solutions today
 * (see SolutionSeeder — only `summary` and `services` are populated).
 * `products`/`articles` are only ever populated by GET
 * /api/solutions/{slug} (the index endpoint doesn't send them), and are
 * currently always `[]` where present — no product_solution/
 * article_solution pivot rows exist yet (see Task 006/008 reports).
 */
export interface Solution {
  id: number;
  slug: string;
  name: string;
  summary: string;
  icon: string | null;
  heroHeading: string | null;
  heroDescription: string | null;
  problemStatement: string | null;
  ourApproach: string | null;
  services: string[] | null;
  outputs: string[] | null;
  tools: string[] | null;
  order: number;
  products?: Product[];
  articles?: Article[];
}
