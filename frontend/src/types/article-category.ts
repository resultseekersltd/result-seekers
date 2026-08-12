/** Mirrors the `article-categories` API resource (backend: app/Models/ArticleCategory.php). */
export interface ArticleCategory {
  id: number;
  slug: string;
  name: string;
  order: number;
}
