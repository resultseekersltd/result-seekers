import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { TrustIndicators } from "@/components/sections/TrustIndicators";
import { AboutSnapshot } from "@/components/sections/AboutSnapshot";
import { SolutionsOverview } from "@/components/sections/SolutionsOverview";
import { ProductsShowcase } from "@/components/sections/ProductsShowcase";
import { AcademyPreview } from "@/components/sections/AcademyPreview";
import { KnowledgeCentrePreview } from "@/components/sections/KnowledgeCentrePreview";
import { NetworkPreview } from "@/components/sections/NetworkPreview";
import { CTASection } from "@/components/layout/CTASection";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

/**
 * Homepage. Section order follows the approved structure in
 * 03_Feature_Specification.md §3 / 04_Development_Tasks.md Task 004, with
 * one section intentionally omitted — see the Task 004 report for why.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <TrustIndicators />
      <AboutSnapshot />
      <SolutionsOverview />
      <ProductsShowcase />
      <AcademyPreview />
      <KnowledgeCentrePreview />
      <NetworkPreview />
      <CTASection
        heading="Let's Work Together"
        description="Get in touch to discuss your research, technology, or capacity development needs."
        primaryAction={{ label: "Start a Project", href: "/contact" }}
        secondaryAction={{ label: "Explore Solutions", href: "/solutions" }}
      />
    </>
  );
}
