import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { CTASection } from "@/components/layout/CTASection";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Strategic Leadership Partners",
  description:
    "Accomplished professionals who support Result Seekers through strategic advice, technical leadership, mentorship, and institutional partnerships.",
  alternates: {
    canonical: "/leadership-partners",
  },
  openGraph: {
    title: "Strategic Leadership Partners | Result Seekers",
    description:
      "Accomplished professionals who support Result Seekers through strategic advice, technical leadership, mentorship, and institutional partnerships.",
    url: "/leadership-partners",
  },
};

/** Verbatim from the description already approved for NetworkPreview.tsx. */
const CONTRIBUTIONS = ["Strategic Advice", "Technical Leadership", "Mentorship", "Institutional Partnerships"] as const;

/**
 * No public API exists yet for strategic_leadership_partners (Backend
 * Phase 2 only covered Solutions/Products/Articles/Courses) — this page
 * describes the programme using the approved copy from
 * 05_Content_and_Product_Specification.md §10 rather than listing real
 * partners or linking to a live application form (strategic-partner-
 * applications has no public endpoint yet), so the call to action routes
 * to the general Contact page instead.
 */
export default function LeadershipPartnersPage() {
  return (
    <>
      <PageHeader
        title="Strategic Leadership Partners"
        description="Accomplished professionals who support Result Seekers through strategic advice, technical leadership, mentorship, and institutional partnerships — distinct from employment and the Expert Pool."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Strategic Leadership Partners" }]}
      />

      <Section>
        <SectionHeader eyebrow="How Partners Contribute" heading="Ways Strategic Leadership Partners work with us" />
        <ul className="mt-8 flex flex-wrap gap-2">
          {CONTRIBUTIONS.map((contribution) => (
            <li key={contribution}>
              <Badge variant="outline" className="normal-case">
                {contribution}
              </Badge>
            </li>
          ))}
        </ul>
      </Section>

      <CTASection
        heading="Become a Strategic Leadership Partner"
        description="Get in touch to start a conversation about a strategic leadership partnership with Result Seekers."
        primaryAction={{ label: "Get in Touch", href: "/contact" }}
        secondaryAction={{ label: "Explore Expert Pool", href: "/expert-network" }}
      />
    </>
  );
}
