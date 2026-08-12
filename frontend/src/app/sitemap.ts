import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getProducts } from "@/lib/api/products";
import { getSolutions } from "@/lib/api/solutions";
import { getArticles } from "@/lib/api/articles";

/**
 * Next.js App Router dynamic sitemap.
 *
 * Includes:
 *  - All static public marketing pages
 *  - All active products (from API)
 *  - All active solutions (from API)
 *  - All published articles (from API, up to 50 per page)
 *
 * Excludes:
 *  - Expert Pool auth/dashboard pages
 *  - BFF API routes (/api/*)
 *  - Any unpublished content (the public API never returns it)
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl;
  const now = new Date();

  // ─── Static public pages ────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/solutions`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/products`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/academy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/knowledge-centre`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/expert-network`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/leadership-partners`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/careers`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${base}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // ─── Dynamic products ────────────────────────────────────────────────────────
  const products = await getProducts();
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${base}/products/${product.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // ─── Dynamic solutions ───────────────────────────────────────────────────────
  const solutions = await getSolutions();
  const solutionPages: MetadataRoute.Sitemap = solutions.map((solution) => ({
    url: `${base}/solutions/${solution.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // ─── Dynamic articles ────────────────────────────────────────────────────────
  // The public API only returns published articles, so no filtering needed.
  // Fetch up to 50 — dynamicParams is true on the detail page so the rest
  // still renders on demand; only the first 50 are included in the sitemap.
  const { data: articles } = await getArticles({ perPage: 50 });
  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${base}/knowledge-centre/${article.slug}`,
    lastModified: article.publishedAt ? new Date(article.publishedAt) : now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...solutionPages, ...articlePages];
}
