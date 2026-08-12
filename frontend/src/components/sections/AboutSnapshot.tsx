import { Compass } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TextLink } from "@/components/ui/TextLink";
import { FadeIn } from "@/components/ui/FadeIn";
import { siteConfig, coreValues } from "@/config/site";

/**
 * Condensed teaser for the About page. Eyebrow/heading are plain
 * structural labels, not invented marketing copy — the body paragraph is
 * the exact approved Company Positioning statement, which is what
 * actually conveys the multidisciplinary breadth (AI/GIS/software
 * engineering, not just research/M&E).
 *
 * The values live inside a bordered Card (with the same dot-grid motif as
 * the Hero, for a consistent visual language) rather than as a loose badge
 * list — a loose list next to a full paragraph left the right column
 * looking like empty space with a few tags floating in it.
 */
export function AboutSnapshot() {
  return (
    <Section>
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-16">
        <FadeIn>
          <p className="text-small text-accent font-semibold tracking-wide uppercase">
            About Result Seekers
          </p>
          <h2 className="text-display text-foreground mt-3">Who We Are</h2>
          <p className="text-body-lg text-muted-foreground mt-4">
            {siteConfig.positioningStatement}
          </p>
          <TextLink href="/about" withArrow className="mt-6">
            Learn more about us
          </TextLink>
        </FadeIn>

        <FadeIn delay={0.15} direction="right">
          <Card className="relative overflow-hidden">
            <div
              className="rounded-card absolute inset-0 [background-image:radial-gradient(var(--color-neutral-light-gray)_1px,transparent_1px)] [background-size:20px_20px] opacity-60"
              aria-hidden="true"
            />
            <div className="relative">
              <span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-full">
                <Compass className="size-5" aria-hidden="true" />
              </span>
              <p className="text-h4 text-foreground mt-4">What Guides Our Work</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {coreValues.map((value) => (
                  <li key={value}>
                    <Badge variant="outline" className="bg-background normal-case">
                      {value}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </FadeIn>
      </div>
    </Section>
  );
}
