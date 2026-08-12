import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { SolutionCard } from "@/components/cards/SolutionCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { FadeIn } from "@/components/ui/FadeIn";
import { getSolutions } from "@/lib/api/solutions";
import { SOLUTION_ICONS } from "@/lib/solution-icons";

export async function SolutionsOverview() {
  const solutions = await getSolutions();

  return (
    <Section tone="muted">
      <FadeIn>
        <SectionHeader
          eyebrow="What We Do"
          heading="Six ways we help organizations succeed"
          description="From generating evidence to building the platforms that put it to work."
        />
      </FadeIn>
      {solutions.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((solution, i) => (
            <FadeIn key={solution.id} delay={0.08 * i} className="h-full">
              <SolutionCard
                solution={solution}
                icon={SOLUTION_ICONS[solution.slug]}
              />
            </FadeIn>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Solutions are temporarily unavailable"
          description="We couldn't reach the solutions catalogue. Please check back shortly."
          className="mt-8"
        />
      )}
    </Section>
  );
}
