import { apiFetch, type ApiCollectionResponse } from "@/lib/api/client";
import type { TeamMember } from "@/types/team-member";

/**
 * Fetches active team members for the About page's "Success Behind Result
 * Seekers" section (Task 014). Falls back to an empty array on failure —
 * see getSolutions() for why — so the section renders its honest
 * EmptyState rather than breaking the page.
 */
export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const { data } = await apiFetch<ApiCollectionResponse<TeamMember>>("/team-members");
    return data;
  } catch (error) {
    console.error("Failed to fetch team members:", error);
    return [];
  }
}
