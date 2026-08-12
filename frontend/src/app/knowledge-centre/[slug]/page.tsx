import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { CTASection } from "@/components/layout/CTASection";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/ErrorState";
import { SolutionCard } from "@/components/cards/SolutionCard";
import { getArticle, getArticles } from "@/lib/api/articles";
import { formatDate } from "@/lib/utils";
import { env } from "@/lib/env";
import { siteConfig } from "@/config/site";

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Prerenders every currently-published article at build time. Fetches a
 * single page of up to 50 (the API's max per_page) — correct for today's
 * reality of 0 published articles; if the corpus ever exceeds 50,
 * `dynamicParams` (default true) still renders the rest on demand, just
 * not pre-built at compile time.
 */
export async function generateStaticParams() {
  const { data: articles } = await getArticles({ perPage: 50 });
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: ArticleDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getArticle(slug);

  if (result.status !== "found") {
    return { robots: { index: false } };
  }

  const { article } = result;

  return {
    title: article.title,
    description: article.summary,
    authors: article.authorName ? [{ name: article.authorName }] : undefined,
    alternates: {
      canonical: `/knowledge-centre/${slug}`,
    },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.summary,
      url: `/knowledge-centre/${slug}`,
      ...(article.publishedAt && {
        publishedTime: article.publishedAt,
      }),
      ...(article.authorName && {
        authors: [article.authorName],
      }),
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = await params;
  const result = await getArticle(slug);

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "error") {
    return (
      <Section>
        <ErrorState description="We couldn't load this article. Please try again shortly." />
      </Section>
    );
  }

  const { article } = result;
  const publishedDate = article.publishedAt ? formatDate(article.publishedAt) : null;
  const paragraphs = article.content.split(/\n{2,}/).filter((p) => p.trim().length > 0);

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
        name: "Knowledge Centre",
        item: `${env.siteUrl}/knowledge-centre`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `${env.siteUrl}/knowledge-centre/${article.slug}`,
      },
    ],
  };

  // Article JSON-LD — uses only real fields from the Article type.
  // `image` is intentionally omitted: coverImagePath is a backend storage
  // path, not a public URL, so it cannot safely be used as a schema image.
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    author: {
      "@type": "Person",
      name: article.authorName,
      ...(article.authorTitle && { jobTitle: article.authorTitle }),
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: env.siteUrl,
    },
    url: `${env.siteUrl}/knowledge-centre/${article.slug}`,
    ...(article.publishedAt && { datePublished: article.publishedAt }),
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={articleJsonLd} />

      <Section tone="muted" spacing="compact">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Knowledge Centre", href: "/knowledge-centre" },
            { label: article.title },
          ]}
          className="mb-6"
        />
        {article.category && (
          <Badge variant="accent" className="mb-4">
            {article.category.name}
          </Badge>
        )}
        <h1 className="text-display text-foreground max-w-3xl">{article.title}</h1>
        <p className="text-body-lg text-muted-foreground mt-4 max-w-2xl">{article.summary}</p>
        <div className="text-small text-muted-foreground mt-6 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            {article.authorName}
            {article.authorTitle && `, ${article.authorTitle}`}
          </span>
          {publishedDate && (
            <>
              <span aria-hidden="true">&middot;</span>
              <span>{publishedDate}</span>
            </>
          )}
          {article.readingTimeMinutes && (
            <>
              <span aria-hidden="true">&middot;</span>
              <span>{article.readingTimeMinutes} min read</span>
            </>
          )}
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="text-body-lg text-foreground [&:not(:first-child)]:mt-6"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="mx-auto mt-12 flex max-w-3xl flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="normal-case">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </Section>

      {article.solutions && article.solutions.length > 0 && (
        <Section tone="muted">
          <SectionHeader eyebrow="Related Solutions" heading="How This Connects to Our Work" />
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {article.solutions.map((solution) => (
              <SolutionCard key={solution.id} solution={solution} />
            ))}
          </div>
        </Section>
      )}

      <CTASection
        heading="Let's Work Together"
        description="Get in touch to discuss your research, technology, or capacity development needs."
        primaryAction={{ label: "Start a Project", href: "/contact" }}
        secondaryAction={{ label: "Explore the Knowledge Centre", href: "/knowledge-centre" }}
      />
    </>
  );
}
