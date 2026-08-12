import { Section } from "@/components/layout/Section";
import { StatCard } from "@/components/ui/StatCard";
import { getTrustIndicators } from "@/lib/api/trust-indicators";

/**
 * Homepage "Trust Indicators" section. Fetches through
 * lib/api/trust-indicators.ts (async, same shape as getSolutions() etc.),
 * which now calls the real `trust_indicators` table/endpoint — this
 * component required no changes when that swap happened.
 */
export async function TrustIndicators() {
  const { numeric, qualitative } = await getTrustIndicators();

  return (
    <Section spacing="compact" tone="muted">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {numeric.map((stat) => (
          <StatCard key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} />
        ))}
      </div>
      <ul className="text-small text-muted-foreground mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 text-center">
        {qualitative.map((indicator) => (
          <li key={indicator}>{indicator}</li>
        ))}
      </ul>
    </Section>
  );
}
