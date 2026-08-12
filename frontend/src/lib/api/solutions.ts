import { ApiError, apiFetch, type ApiCollectionResponse, type ApiSingleResponse } from "@/lib/api/client";
import type { Solution } from "@/types/solution";

/**
 * Fetches the six solution areas for nav/footer use.
 *
 * Falls back to an empty array on failure (rather than throwing) so a
 * backend outage degrades the navbar/footer to plain links instead of
 * crashing the whole site — see Navbar/Footer's empty-state handling.
 */
export async function getSolutions(): Promise<Solution[]> {
  try {
    const { data } = await apiFetch<ApiCollectionResponse<Solution>>("/solutions");
    return data;
  } catch (error) {
    console.error("Failed to fetch solutions:", error);
    return [];
  }
}

export type GetSolutionResult =
  | { status: "found"; solution: Solution }
  | { status: "not-found" }
  | { status: "error" };

/**
 * Fetches a single solution by slug for the Solution Detail Page
 * (/solutions/[slug]) — same discriminated-result pattern as
 * getProduct() (Task 007): the page needs to tell "no such solution"
 * (→ notFound()) apart from "the API is unreachable" (→ ErrorState).
 */
export async function getSolution(slug: string): Promise<GetSolutionResult> {
  try {
    const { data } = await apiFetch<ApiSingleResponse<Solution>>(`/solutions/${slug}`);
    return { status: "found", solution: data };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { status: "not-found" };
    }
    console.error(`Failed to fetch solution "${slug}":`, error);
    return { status: "error" };
  }
}
