import { apiFetch, type ApiCollectionResponse } from "@/lib/api/client";
import type { Tag } from "@/types/tag";

/**
 * The public /api/tags endpoint has existed since Backend Phase 2, but no
 * frontend fetcher called it yet — Knowledge Centre tag-filter UI is not
 * built (deferred to a later task), so this exists now purely to complete
 * the data-layer contract, the same way PartnerCard/TeamCard were declared
 * ahead of their data sources.
 *
 * Falls back to an empty array on failure — see getSolutions() for why.
 */
export async function getTags(): Promise<Tag[]> {
  try {
    const { data } = await apiFetch<ApiCollectionResponse<Tag>>("/tags");
    return data;
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    return [];
  }
}
