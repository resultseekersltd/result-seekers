import { Section } from "@/components/layout/Section";
import { EmptyState } from "@/components/ui/EmptyState";

/** Renders when getSolution() resolves to "not-found" (see solutions.ts) — an unknown/inactive slug, never an empty solution page. */
export default function SolutionNotFound() {
  return (
    <Section spacing="spacious">
      <EmptyState
        title="Solution not found"
        description="We couldn't find a solution at this address. It may have been renamed or is no longer listed."
        action={{ label: "View All Solutions", href: "/solutions" }}
      />
    </Section>
  );
}
