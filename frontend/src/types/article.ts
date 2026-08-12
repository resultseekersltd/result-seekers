import type { ArticleCategory } from "@/types/article-category";
import type { Tag } from "@/types/tag";
import type { Solution } from "@/types/solution";

/**
 * Mirrors the `articles` API resource (backend: app/Models/Article.php).
 * `status` is intentionally not included — the public API only ever
 * returns published articles, so the field is never sent.
 *
 * `category`/`tags`/`solutions` are all `whenLoaded()` in ArticleResource:
 * the index endpoint only eager-loads `category` (so `tags`/`solutions`
 * are absent from list responses), while `show` eager-loads all three.
 * There is no approved Article↔Solution seed data yet (see Task 006
 * report), so `solutions` is currently always `[]` where present, never
 * fabricated relations.
 */
export interface Article {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  authorName: string;
  authorTitle: string | null;
  coverImagePath: string | null;
  readingTimeMinutes: number | null;
  isFeatured: boolean;
  publishedAt: string | null;
  category?: ArticleCategory;
  tags?: Tag[];
  solutions?: Solution[];
}
