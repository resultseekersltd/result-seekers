import { ApiError, apiFetch, type ApiPaginatedResponse, type ApiSingleResponse } from "@/lib/api/client";
import type { Article } from "@/types/article";

interface GetArticlesParams {
  page?: number;
  perPage?: number;
  category?: string;
  tag?: string;
}

/**
 * Returns the full paginated envelope (not just `data`) so listing pages
 * (Task 009/Knowledge Centre) can read `meta.last_page` for Pagination —
 * the homepage preview only reads `.data`.
 *
 * Falls back to an empty page on failure — see getSolutions() for why.
 */
export async function getArticles(
  params: GetArticlesParams = {},
): Promise<ApiPaginatedResponse<Article>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.perPage) query.set("per_page", String(params.perPage));
  if (params.category) query.set("category", params.category);
  if (params.tag) query.set("tag", params.tag);
  const queryString = query.toString();

  try {
    return await apiFetch<ApiPaginatedResponse<Article>>(
      `/articles${queryString ? `?${queryString}` : ""}`,
    );
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return {
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: params.perPage ?? 12, total: 0 },
      error: true,
    };
  }
}

export type GetArticleResult =
  | { status: "found"; article: Article }
  | { status: "not-found" }
  | { status: "error" };

/**
 * Fetches a single article by slug for the Article Detail Page
 * (/knowledge-centre/[slug]) — same discriminated-result pattern as
 * getProduct()/getSolution() (Tasks 007/008).
 */
export async function getArticle(slug: string): Promise<GetArticleResult> {
  try {
    const { data } = await apiFetch<ApiSingleResponse<Article>>(`/articles/${slug}`);
    return { status: "found", article: data };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { status: "not-found" };
    }
    console.error(`Failed to fetch article "${slug}":`, error);
    return { status: "error" };
  }
}
