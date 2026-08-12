import { Handshake, Users } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Card } from "@/components/ui/Card";
import { TextLink } from "@/components/ui/TextLink";
import { FadeIn } from "@/components/ui/FadeIn";

/**
 * No public API exists yet for expert_profiles or
 * strategic_leadership_partners (Backend Phase 2 only covered
 * Solutions/Products/Articles/Courses) — showing real profile cards here
 * would mean either an unbuilt endpoint or fabricated people, neither of
 * which is acceptable. This describes the two programmes instead, using
 * the approved copy from 05_Content_and_Product_Specification.md §9–10,
 * with no data fetch at all.
 */
export function NetworkPreview() {
  return (
    <Section tone="muted">
      <FadeIn>
        <SectionHeader
          eyebrow="Our Network"
          heading="Two ways to work with Result Seekers"
          description="Beyond our core team, we work with a wider network of vetted professionals and senior advisors."
        />
      </FadeIn>
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <FadeIn delay={0.1}>
          <Card>
            <span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-full">
              <Users className="size-5" aria-hidden="true" />
            </span>
            <p className="text-h4 text-foreground mt-4">Expert Pool</p>
            <p className="text-body text-muted-foreground mt-2">
              A nationwide pool of vetted professionals available for project staffing, consultancy
              opportunities, and rapid deployment across research, M&amp;E, GIS, AI, software
              engineering, and more.
            </p>
            <TextLink href="/expert-network" withArrow className="mt-4">
              Join the Expert Pool
            </TextLink>
          </Card>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Card>
            <span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-full">
              <Handshake className="size-5" aria-hidden="true" />
            </span>
            <p className="text-h4 text-foreground mt-4">Strategic Leadership Partners</p>
            <p className="text-body text-muted-foreground mt-2">
              Accomplished professionals who support Result Seekers through strategic advice,
              technical leadership, mentorship, and institutional partnerships — distinct from
              employment and the Expert Pool.
            </p>
            <TextLink href="/leadership-partners" withArrow className="mt-4">
              Become a Strategic Leadership Partner
            </TextLink>
          </Card>
        </FadeIn>
      </div>
    </Section>
  );
}
