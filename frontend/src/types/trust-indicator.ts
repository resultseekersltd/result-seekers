/** Mirrors the `trust-indicators` API resource (backend: app/Models/TrustIndicator.php). */
export type TrustIndicatorType = "numeric" | "qualitative";

export interface TrustIndicator {
  id: number;
  type: TrustIndicatorType;
  value: number | null;
  suffix: string | null;
  label: string;
  order: number;
}
