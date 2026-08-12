import { Section } from "@/components/layout/Section";
import { EmptyState } from "@/components/ui/EmptyState";

/** Renders when getArticle() resolves to "not-found" (see articles.ts) — an unknown/unpublished slug, never an empty article page. */
export default function ArticleNotFound() {
  return (
    <Section spacing="spacious">
      <EmptyState
        title="Article not found"
        description="We couldn't find a publication at this address. It may have been unpublished or moved."
        action={{ label: "View the Knowledge Centre", href: "/knowledge-centre" }}
      />
    </Section>
  );
}
