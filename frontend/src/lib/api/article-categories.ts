import { apiFetch, type ApiCollectionResponse } from "@/lib/api/client";
import type { ArticleCategory } from "@/types/article-category";

export const FALLBACK_ARTICLE_CATEGORIES: ArticleCategory[] = [
  { id: 1, slug: "articles", name: "Articles", order: 1 },
  { id: 2, slug: "reports", name: "Reports", order: 2 },
  { id: 3, slug: "case-studies", name: "Case Studies", order: 3 },
  { id: 4, slug: "data-stories", name: "Data Stories", order: 4 },
  { id: 5, slug: "maps", name: "Maps", order: 5 },
  { id: 6, slug: "dashboards", name: "Dashboards", order: 6 },
  { id: 7, slug: "guides", name: "Guides", order: 7 },
  { id: 8, slug: "templates", name: "Templates", order: 8 },
  { id: 9, slug: "situation-updates", name: "Situation Updates", order: 9 },
  { id: 10, slug: "resources", name: "Resources", order: 10 },
];

/** Falls back to seeded categories on failure. */
export async function getArticleCategories(): Promise<ArticleCategory[]> {
  try {
    const { data } = await apiFetch<ApiCollectionResponse<ArticleCategory>>("/article-categories");
    if (data && data.length > 0) return data;
    return FALLBACK_ARTICLE_CATEGORIES;
  } catch (error) {
    console.warn("API unreachable, using fallback article categories:", error);
    return FALLBACK_ARTICLE_CATEGORIES;
  }
}
