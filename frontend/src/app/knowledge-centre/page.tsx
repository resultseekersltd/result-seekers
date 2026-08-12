import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { CTASection } from "@/components/layout/CTASection";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import { TextLink } from "@/components/ui/TextLink";
import { getArticles } from "@/lib/api/articles";
import { getArticleCategories } from "@/lib/api/article-categories";
import { getTags } from "@/lib/api/tags";

export const metadata: Metadata = {
  title: "Knowledge Centre",
  description:
    "Articles, reports, case studies, and data stories from Result Seekers' research and technology work.",
  alternates: {
    canonical: "/knowledge-centre",
  },
  openGraph: {
    title: "Knowledge Centre | Result Seekers",
    description:
      "Articles, reports, case studies, and data stories from Result Seekers' research and technology work.",
    url: "/knowledge-centre",
  },
};

interface KnowledgeCentrePageProps {
  searchParams: Promise<{ page?: string; category?: string; tag?: string }>;
}

/** Builds a Knowledge Centre URL, carrying forward whichever filters are still active. */
function buildHref({
  page,
  category,
  tag,
}: {
  page?: number;
  category?: string;
  tag?: string;
}): string {
  const query = new URLSearchParams();
  if (page && page > 1) query.set("page", String(page));
  if (category) query.set("category", category);
  if (tag) query.set("tag", tag);
  const queryString = query.toString();
  return `/knowledge-centre${queryString ? `?${queryString}` : ""}`;
}

/**
 * No articles have been published yet (see Task 005 report) — the API
 * genuinely supports category/tag filtering (ArticleController@index), so
 * that's what's built here; full-text search is NOT implemented, because
 * the backend has no search parameter to call (see Task 009 report) and a
 * client-side search over one paginated page would only search whatever
 * happens to be loaded, which would be misleading.
 */
export default async function KnowledgeCentrePage({ searchParams }: KnowledgeCentrePageProps) {
  const { page, category, tag } = await searchParams;
  const currentPage = Number(page) > 0 ? Number(page) : 1;
  const hasFilters = Boolean(category || tag);

  const [{ data: articles, meta, error: articlesError }, categories, tags] = await Promise.all([
    getArticles({ page: currentPage, perPage: 9, category, tag }),
    getArticleCategories(),
    getTags(),
  ]);

  return (
    <>
      <PageHeader
        title="Knowledge Centre"
        description="Evidence and insight from our work, shared openly — articles, reports, case studies, and data stories."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Knowledge Centre" }]}
      />

      <Section spacing="compact">
        <SectionHeader eyebrow="Content Types" heading="Browse by Category" />
        <ul className="mt-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <li key={c.id}>
              <Badge
                variant={category === c.slug ? "accent" : "outline"}
                className="normal-case"
                href={
                  category === c.slug
                    ? buildHref({ tag })
                    : buildHref({ category: c.slug, tag })
                }
              >
                {c.name}
              </Badge>
            </li>
          ))}
        </ul>

        {tags.length > 0 && (
          <>
            <SectionHeader eyebrow="Tags" heading="Browse by Tag" className="mt-8" />
            <ul className="mt-6 flex flex-wrap gap-2">
              {tags.map((t) => (
                <li key={t.id}>
                  <Badge
                    variant={tag === t.slug ? "accent" : "outline"}
                    className="normal-case"
                    href={tag === t.slug ? buildHref({ category }) : buildHref({ category, tag: t.slug })}
                  >
                    {t.name}
                  </Badge>
                </li>
              ))}
            </ul>
          </>
        )}

        {hasFilters && (
          <TextLink href="/knowledge-centre" className="mt-6">
            Clear filters
          </TextLink>
        )}
      </Section>

      <Section tone="muted">
        {articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
            <Pagination
              currentPage={meta.current_page}
              lastPage={meta.last_page}
              getHref={(p) => buildHref({ page: p, category, tag })}
            />
          </>
        ) : articlesError ? (
          <ErrorState description="We couldn't load the Knowledge Centre. Please try again shortly." />
        ) : hasFilters ? (
          <EmptyState
            title="No articles match these filters"
            description="Try a different category or tag, or clear your filters to see everything that's been published."
            action={{ label: "Clear Filters", href: "/knowledge-centre" }}
          />
        ) : (
          <EmptyState
            title="Publications are coming soon"
            description="Articles, reports, and case studies will appear here as they're published."
            action={{ label: "Get in Touch", href: "/contact" }}
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
