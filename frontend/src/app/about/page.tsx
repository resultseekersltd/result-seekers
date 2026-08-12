import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { CTASection } from "@/components/layout/CTASection";
import { Badge } from "@/components/ui/Badge";
import { TextLink } from "@/components/ui/TextLink";
import { TrustIndicators } from "@/components/sections/TrustIndicators";
import { siteConfig, coreValues } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Result Seekers — our positioning, core values, and the principles that guide our research, technology, and capacity development work.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Result Seekers",
    description:
      "Learn about Result Seekers — our positioning, core values, and the principles that guide our research, technology, and capacity development work.",
    url: "/about",
  },
};

/**
 * Content gaps (not fabricated — see the Task 005 report): the spec names
 * "Mission", "Vision", "Our Story", and "Why Choose Result Seekers" as
 * About-page sections (03_Feature_Specification.md §4) but never supplies
 * their copy anywhere in the 5 spec docs, so none of those sections exist
 * below. A "Meet the Team" section is also omitted — team_members has no
 * public API endpoint yet (TeamCard is built and ready for when one exists).
 */
export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About Result Seekers"
        description={siteConfig.description}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-small font-semibold tracking-wide text-accent uppercase">
            Who We Are
          </p>
          <p className="text-body-lg text-foreground mt-4">{siteConfig.positioningStatement}</p>
          <TextLink href="/solutions" withArrow className="mt-6 justify-center">
            Explore our solutions
          </TextLink>
        </div>
      </Section>

      <TrustIndicators />

      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-small font-semibold tracking-wide text-accent uppercase">
            Our Values
          </p>
          <h2 className="text-display text-foreground mt-3">What Guides Our Work</h2>
        </div>
        <ul className="mt-8 flex flex-wrap justify-center gap-2">
          {coreValues.map((value) => (
            <li key={value}>
              <Badge variant="outline" className="normal-case">
                {value}
              </Badge>
            </li>
          ))}
        </ul>
      </Section>

      <CTASection
        heading="Let's Work Together"
        description="Get in touch to discuss your research, technology, or capacity development needs."
        primaryAction={{ label: "Start a Project", href: "/contact" }}
        secondaryAction={{ label: "Explore Solutions", href: "/solutions" }}
      />
    </>
  );
}
