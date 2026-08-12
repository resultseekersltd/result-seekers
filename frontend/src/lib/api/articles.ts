import { ApiError, apiFetch, type ApiPaginatedResponse, type ApiSingleResponse } from "@/lib/api/client";
import type { Article } from "@/types/article";

export const FALLBACK_ARTICLES: Article[] = [
  {
    id: 1,
    slug: "leveraging-ai-for-evidence-based-policy-making-in-africa",
    title: "Leveraging Artificial Intelligence for Evidence-Based Policy Making in Africa",
    summary: "How modern machine learning models and spatial intelligence are reshaping public policy assessment, research speed, and institutional transparency across West Africa.",
    content: `
      <p>In an era of rapid digital transformation, public institutions and international development organizations across Africa are increasingly turning to data science and artificial intelligence to inform high-stakes decisions.</p>
      
      <h3>The Challenge of Traditional Data Collection</h3>
      <p>Historically, baseline and endline evaluations relied on lengthy manual survey cycles that took months to clean, analyze, and publish. By the time policy reports were finalized, field dynamics had often evolved.</p>

      <h3>Enter Machine Learning & Geospatial Analytics</h3>
      <p>By pairing remote sensing satellite imagery with machine learning algorithms, research teams can now map economic activity, agricultural yield, and infrastructure gaps in near real-time.</p>

      <h3>Key Takeaways for Decision-Makers</h3>
      <ul>
        <li>Integrated data pipelines shorten decision feedback loops from months to days.</li>
        <li>Interactive dashboards democratize access to evidence across government ministries.</li>
        <li>Combining qualitative qualitative surveys with AI spatial models yields unmatched rigor.</li>
      </ul>
    `,
    authorName: "Result Seekers Research Team",
    authorTitle: "Strategy & Intelligence Practice",
    coverImagePath: null,
    readingTimeMinutes: 5,
    isFeatured: true,
    publishedAt: "2026-02-10T09:00:00Z",
    category: { id: 1, slug: "articles", name: "Articles", order: 1 },
    tags: [
      { id: 1, slug: "ai", name: "AI" },
      { id: 2, slug: "policy", name: "Policy" },
      { id: 3, slug: "research", name: "Research" },
    ],
  },
  {
    id: 2,
    slug: "building-resilient-meal-frameworks-for-complex-humanitarian-programs",
    title: "Building Resilient MEAL Frameworks for Complex Humanitarian Programs",
    summary: "A practical guide to designing flexible Monitoring, Evaluation, Accountability, and Learning systems in unpredictable operating environments.",
    content: `
      <p>Humanitarian and emergency management programs operate in high-volatility contexts. Traditional static monitoring frameworks frequently struggle to adapt when security or environmental conditions shift.</p>

      <h3>Adaptive Monitoring Architecture</h3>
      <p>An adaptive MEAL framework prioritizes real-time mobile data collection, dynamic indicator benchmarks, and feedback loops that feed directly into weekly operations.</p>
    `,
    authorName: "Dr. Aliyu Ibrahim",
    authorTitle: "Senior MEAL Specialist",
    coverImagePath: null,
    readingTimeMinutes: 7,
    isFeatured: false,
    publishedAt: "2026-01-25T14:30:00Z",
    category: { id: 2, slug: "reports", name: "Reports", order: 2 },
    tags: [
      { id: 4, slug: "meal", name: "MEAL" },
      { id: 5, slug: "humanitarian", name: "Humanitarian" },
    ],
  },
  {
    id: 3,
    slug: "digital-transformation-in-tertiary-education-case-study",
    title: "Digital Transformation in Tertiary Education: Result Campus Implementation",
    summary: "Case study on how tertiary institutions streamlined admissions, result computation, and transcript requests using modern cloud platforms.",
    content: `
      <p>Higher education institutions face increasing pressure to digitize administrative workflows, prevent transcript fraud, and offer seamless online student experiences.</p>
    `,
    authorName: "Result Seekers Tech Division",
    authorTitle: "Software Engineering",
    coverImagePath: null,
    readingTimeMinutes: 4,
    isFeatured: false,
    publishedAt: "2026-01-12T11:15:00Z",
    category: { id: 3, slug: "case-studies", name: "Case Studies", order: 3 },
    tags: [
      { id: 6, slug: "edtech", name: "EdTech" },
      { id: 7, slug: "digital-transformation", name: "Digital Transformation" },
    ],
  },
];

interface GetArticlesParams {
  page?: number;
  perPage?: number;
  category?: string;
  tag?: string;
}

/**
 * Returns articles envelope. Falls back to FALLBACK_ARTICLES on API failure.
 */
export async function getArticles(
  params: GetArticlesParams = {},
): Promise<ApiPaginatedResponse<Article>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.perPage) query.set("per_page", String(params.perPage));
  if (params.category) query.set("category", params.category);
  if (params.tag) query.set("tag", params.tag);
  const queryString = query.toString();

  try {
    const response = await apiFetch<ApiPaginatedResponse<Article>>(
      `/articles${queryString ? `?${queryString}` : ""}`,
    );
    if (response.data && response.data.length > 0) return response;
    return {
      data: FALLBACK_ARTICLES,
      meta: { current_page: 1, last_page: 1, per_page: params.perPage ?? 12, total: FALLBACK_ARTICLES.length },
    };
  } catch (error) {
    console.warn("API unreachable, using fallback articles:", error);
    let filtered = FALLBACK_ARTICLES;
    if (params.category) {
      filtered = filtered.filter((a) => a.category?.slug === params.category);
    }
    return {
      data: filtered,
      meta: { current_page: 1, last_page: 1, per_page: params.perPage ?? 12, total: filtered.length },
    };
  }
}

export type GetArticleResult =
  | { status: "found"; article: Article }
  | { status: "not-found" }
  | { status: "error" };

/**
 * Fetches a single article by slug. Falls back to seeded article on API failure.
 */
export async function getArticle(slug: string): Promise<GetArticleResult> {
  try {
    const { data } = await apiFetch<ApiSingleResponse<Article>>(`/articles/${slug}`);
    return { status: "found", article: data };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { status: "not-found" };
    }
    const fallback = FALLBACK_ARTICLES.find((a) => a.slug === slug);
    if (fallback) {
      return { status: "found", article: fallback };
    }
    console.warn(`API unreachable for article "${slug}", no fallback found:`, error);
    return { status: "error" };
  }
}
