import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { CTASection } from "@/components/layout/CTASection";
import { Badge } from "@/components/ui/Badge";
import { TextLink } from "@/components/ui/TextLink";
import { TrustIndicators } from "@/components/sections/TrustIndicators";
import { siteConfig, coreValues } from "@/config/site";
import { FadeIn } from "@/components/ui/FadeIn";

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

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About Result Seekers"
        description={siteConfig.description}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      <Section>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <FadeIn>
            <div className="flex flex-col gap-4">
              <p className="text-small font-semibold tracking-wide text-accent uppercase">
                Who We Are
              </p>
              <h2 className="text-display text-foreground">
                Delivering High-Impact Strategy & Digital Solutions
              </h2>
              <p className="text-body-lg text-muted-foreground">
                {siteConfig.positioningStatement}
              </p>
              <div className="mt-4">
                <TextLink href="/solutions" withArrow>
                  Explore our solutions
                </TextLink>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/30 p-2 shadow-xl">
              <div className="relative aspect-4/3 overflow-hidden rounded-xl">
                <Image
                  src="/images/about-team.png"
                  alt="Result Seekers Executive Research & Development Team"
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </FadeIn>
        </div>
      </Section>

      <TrustIndicators />

      <Section tone="muted">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-small font-semibold tracking-wide text-accent uppercase">
            Our Values
          </p>
          <h2 className="text-display text-foreground mt-3">What Guides Our Work</h2>
        </div>
        <ul className="mt-8 flex flex-wrap justify-center gap-3">
          {coreValues.map((value) => (
            <li key={value}>
              <Badge variant="outline" className="px-4 py-2 text-sm normal-case shadow-xs hover:border-primary transition-colors">
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
