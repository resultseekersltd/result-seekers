import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Check, ExternalLink } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { CTASection } from "@/components/layout/CTASection";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { SolutionCard } from "@/components/cards/SolutionCard";
import { PRODUCT_STATUS_BADGE_VARIANTS, PRODUCT_STATUS_LABELS } from "@/lib/product-status";
import { getProduct, getProducts } from "@/lib/api/products";
import { env } from "@/lib/env";
import type { Product } from "@/types/product";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

/** Prerenders every currently-active product at build time. */
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProduct(slug);

  if (result.status !== "found") {
    return { robots: { index: false } };
  }

  const { product } = result;
  const description = product.shortDescription;

  return {
    title: product.name,
    description,
    alternates: {
      canonical: `/products/${slug}`,
    },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: `/products/${slug}`,
    },
  };
}

/**
 * Content blocks below the hero/about, built as a list rather than fixed
 * JSX so tone alternation (default/muted) stays correct regardless of
 * which optional sections a given product actually has — Target Users,
 * Features, and Related Solutions are each conditional on real data.
 */
function buildContentSections(product: Product): { key: string; content: ReactNode }[] {
  const sections: { key: string; content: ReactNode }[] = [
    {
      key: "about",
      content: (
        <>
          <SectionHeader eyebrow="About" heading={`About ${product.name}`} />
          <p className="text-body-lg text-foreground mt-6 max-w-3xl">{product.description}</p>
        </>
      ),
    },
  ];

  if (product.targetUsers && product.targetUsers.length > 0) {
    sections.push({
      key: "target-users",
      content: (
        <>
          <SectionHeader eyebrow="Who It's For" heading="Target Users" />
          <ul className="mt-8 flex flex-wrap gap-2">
            {product.targetUsers.map((user) => (
              <li key={user}>
                <Badge variant="outline" className="normal-case">
                  {user}
                </Badge>
              </li>
            ))}
          </ul>
        </>
      ),
    });
  }

  if (product.features && product.features.length > 0) {
    sections.push({
      key: "features",
      content: (
        <>
          <SectionHeader eyebrow="Capabilities" heading="Key Features" />
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {product.features.map((feature) => (
              <li key={feature} className="text-body text-foreground flex items-start gap-2">
                <Check className="text-primary mt-1 size-4 shrink-0" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
        </>
      ),
    });
  }

  if (product.solutions && product.solutions.length > 0) {
    sections.push({
      key: "related-solutions",
      content: (
        <>
          <SectionHeader
            eyebrow="Related Solutions"
            heading={`How ${product.name} Connects to Our Solutions`}
          />
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {product.solutions.map((solution) => (
              <SolutionCard key={solution.id} solution={solution} />
            ))}
          </div>
        </>
      ),
    });
  }

  return sections;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const result = await getProduct(slug);

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "error") {
    return (
      <Section>
        <ErrorState description="We couldn't load this product. Please try again shortly." />
      </Section>
    );
  }

  const { product } = result;

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
        name: "Products",
        item: `${env.siteUrl}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${env.siteUrl}/products/${product.slug}`,
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
            { label: "Products", href: "/products" },
            { label: product.name },
          ]}
          className="mb-6"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={PRODUCT_STATUS_BADGE_VARIANTS[product.status]}>
            {PRODUCT_STATUS_LABELS[product.status]}
          </Badge>
          <span className="text-small text-muted-foreground">{product.category}</span>
        </div>
        <h1 className="text-display text-foreground mt-4 max-w-3xl">{product.name}</h1>
        <p className="text-body-lg text-muted-foreground mt-4 max-w-2xl">
          {product.shortDescription}
        </p>
        {product.externalUrl && (
          <div className="mt-8">
            <Button
              href={product.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              aria-label={`Visit ${product.name} (opens in a new tab)`}
            >
              Visit {product.name}
              <ExternalLink className="size-4" aria-hidden="true" />
            </Button>
            <p className="text-small text-muted-foreground mt-2">
              Opens in a new tab — you&apos;ll be leaving the Result Seekers website.
            </p>
          </div>
        )}
      </Section>

      {buildContentSections(product).map((section, index) => (
        <Section key={section.key} tone={index % 2 === 0 ? "default" : "muted"}>
          {section.content}
        </Section>
      ))}

      <CTASection
        heading="Let's Work Together"
        description="Get in touch to discuss your research, technology, or capacity development needs."
        primaryAction={{ label: "Start a Project", href: "/contact" }}
        secondaryAction={{ label: "Explore Other Products", href: "/products" }}
      />
    </>
  );
}
