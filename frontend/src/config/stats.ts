import type { NumericTrustIndicator } from "@/lib/api/trust-indicators";

/**
 * The 8 approved trust indicators — 05_Content_and_Product_Specification.md
 * §3 / 01_Project_Vision_and_Architecture.md §7. This is the complete,
 * capped list; the docs explicitly say not to add more.
 *
 * Migration path approved (Task 004 refinement): this stays the data
 * source for now, but src/lib/api/trust-indicators.ts is the swap point —
 * update that one function when a real backend model exists, and nothing
 * else in the app needs to change. `NumericTrustIndicator` is defined
 * there (the future API contract), not here, so this file conforms to it
 * rather than the other way around.
 *
 * Split into two groups: three of the eight have an actual number
 * (suited to StatCard/AnimatedCounter); the other five are qualitative
 * statements with no number to animate, so forcing them into stat-card
 * shape would be misleading.
 */
export const numericTrustIndicators: NumericTrustIndicator[] = [
  { value: 16, suffix: "+", label: "Years of Experience" },
  { value: 50, suffix: "+", label: "Projects & Assignments Delivered" },
  { value: 20, suffix: "+", label: "Organizations Supported" },
];

export const qualitativeTrustIndicators: string[] = [
  "Offices in Abuja and Kano",
  "Nationwide team of staff, consultants, and interns",
  "Multidisciplinary team",
  "Technology products in operation and under development",
  "Experience across humanitarian, development, government, and private sectors",
];
