import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { CTASection } from "@/components/layout/CTASection";
import { ProductCard } from "@/components/cards/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { getProducts } from "@/lib/api/products";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Digital platforms built by Result Seekers — research, monitoring, education and data tools for development organisations.",
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "Products | Result Seekers",
    description:
      "Digital platforms built by Result Seekers — research, monitoring, education and data tools for development organisations.",
    url: "/products",
  },
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <>
      <PageHeader
        title="Products"
        description="Each product is its own platform, built and maintained independently of this website."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Products" }]}
      />

      <Section>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Products are temporarily unavailable"
            description="We couldn't reach the product catalogue. Please check back shortly."
          />
        )}
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
