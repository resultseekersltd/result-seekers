import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FadeIn } from "@/components/ui/FadeIn";
import { getArticles } from "@/lib/api/articles";
import { getArticleCategories } from "@/lib/api/article-categories";

/**
 * No articles have been published yet, so this degrades the same way
 * AcademyPreview does: real article cards once they exist, or — today —
 * a teaser built from the real, already-seeded content-type taxonomy.
 */
export async function KnowledgeCentrePreview() {
  const [{ data: articles }, categories] = await Promise.all([
    getArticles({ perPage: 3 }),
    getArticleCategories(),
  ]);

  return (
    <Section spacing="compact">
      <FadeIn>
        <SectionHeader
          eyebrow="Knowledge Centre"
          heading="Evidence and insight, shared openly"
          description="Articles, reports, case studies, and data stories from our work."
        />
      </FadeIn>

      {articles.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {articles.length === 0 && categories.length > 0 && (
        <div className="mt-6">
          <ul className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Badge variant="outline" className="normal-case">
                  {category.name}
                </Badge>
              </li>
            ))}
          </ul>
          <p className="text-small text-muted-foreground mt-4">
            Publications are coming soon — these are the content types the Knowledge Centre will
            cover.
          </p>
        </div>
      )}

      {articles.length === 0 && categories.length === 0 && (
        <EmptyState
          title="Knowledge Centre content is temporarily unavailable"
          description="We couldn't reach the Knowledge Centre. Please check back shortly."
          className="mt-6"
        />
      )}

      <Button href="/knowledge-centre" variant="secondary" className="mt-8">
        Visit the Knowledge Centre
      </Button>
    </Section>
  );
}
