import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { CTASection } from "@/components/layout/CTASection";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/ErrorState";
import { ProductCard } from "@/components/cards/ProductCard";
import { SOLUTION_ICONS } from "@/lib/solution-icons";
import { getSolution, getSolutions } from "@/lib/api/solutions";
import { env } from "@/lib/env";
import type { Solution } from "@/types/solution";

interface SolutionDetailPageProps {
  params: Promise<{ slug: string }>;
}

/** Prerenders every currently-active solution at build time. */
export async function generateStaticParams() {
  const solutions = await getSolutions();
  return solutions.map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata({
  params,
}: SolutionDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getSolution(slug);

  if (result.status !== "found") {
    return { robots: { index: false } };
  }

  const { solution } = result;
  const description = solution.heroDescription ?? solution.summary;

  return {
    title: solution.name,
    description,
    alternates: {
      canonical: `/solutions/${slug}`,
    },
    openGraph: {
      type: "website",
      title: solution.name,
      description,
      url: `/solutions/${slug}`,
    },
  };
}

/**
 * Content blocks below the hero, built as a list rather than fixed JSX so
 * tone alternation (default/muted) stays correct regardless of which
 * optional sections a given solution actually has. Problem Statement, Our
 * Approach, Outputs, Tools, and Related Products are all conditional on
 * real data; Services is the only block populated for all six solutions
 * today (see SolutionSeeder) but is still guarded the same way in case a
 * future solution ships without one.
 */
function buildContentSections(solution: Solution): { key: string; content: ReactNode }[] {
  const sections: { key: string; content: ReactNode }[] = [];

  if (solution.problemStatement) {
    sections.push({
      key: "problem",
      content: (
        <>
          <SectionHeader eyebrow="The Challenge" heading="Problem Statement" />
          <p className="text-body-lg text-foreground mt-6 max-w-3xl">
            {solution.problemStatement}
          </p>
        </>
      ),
    });
  }

  if (solution.ourApproach) {
    sections.push({
      key: "approach",
      content: (
        <>
          <SectionHeader eyebrow="How We Help" heading="Our Approach" />
          <p className="text-body-lg text-foreground mt-6 max-w-3xl">{solution.ourApproach}</p>
        </>
      ),
    });
  }

  if (solution.services && solution.services.length > 0) {
    sections.push({
      key: "services",
      content: (
        <>
          <SectionHeader eyebrow="What We Offer" heading="Services" />
          <ul className="mt-8 flex flex-wrap gap-2">
            {solution.services.map((service) => (
              <li key={service}>
                <Badge variant="outline" className="normal-case">
                  {service}
                </Badge>
              </li>
            ))}
          </ul>
        </>
      ),
    });
  }

  if (solution.outputs && solution.outputs.length > 0) {
    sections.push({
      key: "outputs",
      content: (
        <>
          <SectionHeader eyebrow="What You Get" heading="Outputs" />
          <ul className="mt-8 flex flex-wrap gap-2">
            {solution.outputs.map((output) => (
              <li key={output}>
                <Badge variant="outline" className="normal-case">
                  {output}
                </Badge>
              </li>
            ))}
          </ul>
        </>
      ),
    });
  }

  if (solution.tools && solution.tools.length > 0) {
    sections.push({
      key: "tools",
      content: (
        <>
          <SectionHeader eyebrow="How We Work" heading="Tools & Methods" />
          <ul className="mt-8 flex flex-wrap gap-2">
            {solution.tools.map((tool) => (
              <li key={tool}>
                <Badge variant="outline" className="normal-case">
                  {tool}
                </Badge>
              </li>
            ))}
          </ul>
        </>
      ),
    });
  }

  if (solution.products && solution.products.length > 0) {
    sections.push({
      key: "related-products",
      content: (
        <>
          <SectionHeader
            eyebrow="Related Products"
            heading={`Products Built on ${solution.name}`}
          />
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {solution.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ),
    });
  }

  return sections;
}

export default async function SolutionDetailPage({ params }: SolutionDetailPageProps) {
  const { slug } = await params;
  const result = await getSolution(slug);

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "error") {
    return (
      <Section>
        <ErrorState description="We couldn't load this solution. Please try again shortly." />
      </Section>
    );
  }

  const { solution } = result;
  // The API's `icon` field is currently null for every seeded solution —
  // see SOLUTION_ICONS's own doc comment for why the lookup is by slug.
  const Icon = SOLUTION_ICONS[solution.slug];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: env.siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Solutions",
        item: `${env.siteUrl}/solutions`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: solution.name,
        item: `${env.siteUrl}/solutions/${solution.slug}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />

      <Section tone="muted" spacing="compact">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Solutions", href: "/solutions" },
            { label: solution.name },
          ]}
          className="mb-6"
        />
        {Icon && (
          <span className="bg-primary/10 text-primary mb-4 flex size-12 items-center justify-center rounded-full">
            <Icon className="size-6" aria-hidden="true" />
          </span>
        )}
        <h1 className="text-display text-foreground max-w-3xl">
          {solution.heroHeading ?? solution.name}
        </h1>
        <p className="text-body-lg text-muted-foreground mt-4 max-w-2xl">
          {solution.heroDescription ?? solution.summary}
        </p>
      </Section>

      {buildContentSections(solution).map((section, index) => (
        <Section key={section.key} tone={index % 2 === 0 ? "default" : "muted"}>
          {section.content}
        </Section>
      ))}

      <CTASection
        heading="Let's Work Together"
        description="Get in touch to discuss your research, technology, or capacity development needs."
        primaryAction={{ label: "Start a Project", href: "/contact" }}
        secondaryAction={{ label: "Explore Other Solutions", href: "/solutions" }}
      />
    </>
  );
}
