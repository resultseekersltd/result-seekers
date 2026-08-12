import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ProductCard } from "@/components/cards/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { FadeIn } from "@/components/ui/FadeIn";
import { getProducts } from "@/lib/api/products";

export async function ProductsShowcase() {
  const products = await getProducts();

  return (
    <Section>
      <FadeIn>
        <SectionHeader
          eyebrow="Our Products"
          heading="Independent platforms, built by Result Seekers"
          description="Each product is its own platform — introduced here, not hosted here."
        />
      </FadeIn>
      {products.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => (
            <FadeIn key={product.id} delay={0.08 * i} className="h-full">
              <ProductCard product={product} />
            </FadeIn>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Products are temporarily unavailable"
          description="We couldn't reach the product catalogue. Please check back shortly."
          className="mt-8"
        />
      )}
    </Section>
  );
}
