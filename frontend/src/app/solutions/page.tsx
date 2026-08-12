import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { CTASection } from "@/components/layout/CTASection";
import { SolutionCard } from "@/components/cards/SolutionCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSolutions } from "@/lib/api/solutions";
import { SOLUTION_ICONS } from "@/lib/solution-icons";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Six ways Result Seekers helps organizations turn evidence, data, and technology into decisions and impact.",
  alternates: {
    canonical: "/solutions",
  },
  openGraph: {
    title: "Solutions | Result Seekers",
    description:
      "Six ways Result Seekers helps organizations turn evidence, data, and technology into decisions and impact.",
    url: "/solutions",
  },
};

export default async function SolutionsPage() {
  const solutions = await getSolutions();

  return (
    <>
      <PageHeader
        title="Solutions"
        description="From generating evidence to building the digital platforms that put it to work — six ways we help organizations succeed."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Solutions" }]}
      />

      <Section>
        {solutions.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map((solution) => (
              <SolutionCard key={solution.id} solution={solution} icon={SOLUTION_ICONS[solution.slug]} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Solutions are temporarily unavailable"
            description="We couldn't reach the solutions catalogue. Please check back shortly."
          />
        )}
      </Section>

      <CTASection
        heading="Let's Work Together"
        description="Get in touch to discuss your research, technology, or capacity development needs."
        primaryAction={{ label: "Start a Project", href: "/contact" }}
        secondaryAction={{ label: "Explore Products", href: "/products" }}
      />
    </>
  );
}
