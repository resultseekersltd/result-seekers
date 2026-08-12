import { Section } from "@/components/layout/Section";
import { EmptyState } from "@/components/ui/EmptyState";

/** Renders when getProduct() resolves to "not-found" (see products.ts) — an unknown/inactive slug, never an empty product page. */
export default function ProductNotFound() {
  return (
    <Section spacing="spacious">
      <EmptyState
        title="Product not found"
        description="We couldn't find a product at this address. It may have been renamed or is no longer listed."
        action={{ label: "View All Products", href: "/products" }}
      />
    </Section>
  );
}
