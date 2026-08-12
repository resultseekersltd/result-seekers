import { apiFetch, type ApiCollectionResponse } from "@/lib/api/client";
import type { TrustIndicator } from "@/types/trust-indicator";

export interface NumericTrustIndicator {
  value: number;
  suffix: string;
  label: string;
}

export interface TrustIndicators {
  numeric: NumericTrustIndicator[];
  qualitative: string[];
}

/**
 * This was the designated swap point from the Task 004 refinement, and
 * it's now swapped: previously returned the static config in
 * src/config/stats.ts (removed), now calls the real `trust_indicators`
 * table via GET /api/trust-indicators. TrustIndicators.tsx (the only
 * caller) required zero changes — same function name, same return shape.
 *
 * Falls back to empty on failure — see getSolutions() for why.
 */
export async function getTrustIndicators(): Promise<TrustIndicators> {
  try {
    const { data } = await apiFetch<ApiCollectionResponse<TrustIndicator>>("/trust-indicators");

    return {
      numeric: data
        .filter((indicator) => indicator.type === "numeric" && indicator.value !== null)
        .map((indicator) => ({
          value: indicator.value as number,
          suffix: indicator.suffix ?? "",
          label: indicator.label,
        })),
      qualitative: data
        .filter((indicator) => indicator.type === "qualitative")
        .map((indicator) => indicator.label),
    };
  } catch (error) {
    console.error("Failed to fetch trust indicators:", error);
    return { numeric: [], qualitative: [] };
  }
}
