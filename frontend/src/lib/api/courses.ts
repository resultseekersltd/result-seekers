import { apiFetch, type ApiPaginatedResponse } from "@/lib/api/client";
import type { Course } from "@/types/course";

interface GetCoursesParams {
  page?: number;
  perPage?: number;
  category?: string;
  track?: string;
}

/**
 * Returns the full paginated envelope (not just `data`) so listing pages
 * (Academy) can read `meta.last_page` for Pagination — the homepage
 * preview only reads `.data`. The Academy page does not currently render
 * pagination controls (only 0-9 courses exist today), but `page` is
 * supported here for contract parity with getArticles() and for when it's
 * needed.
 *
 * Falls back to an empty page on failure — see getSolutions() for why.
 */
export async function getCourses(
  params: GetCoursesParams = {},
): Promise<ApiPaginatedResponse<Course>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.perPage) query.set("per_page", String(params.perPage));
  if (params.category) query.set("category", params.category);
  if (params.track) query.set("track", params.track);
  const queryString = query.toString();

  try {
    return await apiFetch<ApiPaginatedResponse<Course>>(
      `/courses${queryString ? `?${queryString}` : ""}`,
    );
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return {
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: params.perPage ?? 12, total: 0 },
      error: true,
    };
  }
}
