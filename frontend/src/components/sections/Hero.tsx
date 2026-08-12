import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { siteConfig } from "@/config/site";

/**
 * Homepage hero. Copy is the approved tagline + elevator pitch verbatim
 * from 05_Content_and_Product_Specification.md (via siteConfig) — no new
 * marketing copy was written, only re-laid-out: left column is
 * eyebrow/headline/subtext/CTAs at a controlled max-width instead of a
 * single oversized centered block, with a professional photo on the right
 * balancing the two-column layout on larger screens.
 */
export function Hero() {
  return (
    <section className="bg-background py-12 md:py-16 lg:py-20">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <FadeIn>
          {/* Exact words from 01_Project_Vision_and_Architecture.md §8 "Strategic Positioning". */}
          <p className="text-small text-accent font-semibold tracking-wide uppercase">
            Research &middot; Technology &middot; Evidence &middot; Innovation
          </p>
          <h1 className="text-display text-foreground mt-4 max-w-xl">{siteConfig.tagline}</h1>
          <p className="text-body-lg text-muted-foreground mt-6 max-w-lg">
            {siteConfig.description}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button href="/contact" size="lg">
              {siteConfig.primaryCta}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button href="/solutions" variant="secondary" size="lg">
              Explore Solutions
            </Button>
          </div>
        </FadeIn>

        <FadeIn delay={0.15} direction="left">
          <HeroVisual />
        </FadeIn>
      </Container>
    </section>
  );
}

/**
 * Professional photo of the Result Seekers team at work.
 * Replaces the earlier abstract dot-grid + floating-cards placeholder
 * per Task 013 visual assets requirement.
 */
function HeroVisual() {
  return (
    <div className="rounded-feature border-border relative overflow-hidden border shadow-elevated">
      <Image
        src="/images/hero.png"
        alt="Result Seekers professionals collaborating on data and analytics"
        width={640}
        height={480}
        className="w-full object-cover"
        priority
      />
      {/* Subtle brand-purple gradient overlay for visual depth */}
      <div
        className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}
