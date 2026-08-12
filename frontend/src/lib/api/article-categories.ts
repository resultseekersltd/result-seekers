import { apiFetch, type ApiCollectionResponse } from "@/lib/api/client";
import type { ArticleCategory } from "@/types/article-category";

/** Falls back to an empty array on failure — see getSolutions() for why. */
export async function getArticleCategories(): Promise<ArticleCategory[]> {
  try {
    const { data } = await apiFetch<ApiCollectionResponse<ArticleCategory>>("/article-categories");
    return data;
  } catch (error) {
    console.error("Failed to fetch article categories:", error);
    return [];
  }
}
