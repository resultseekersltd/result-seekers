import { env } from "@/lib/env";

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Laravel's default JsonResource::collection() envelope. */
export interface ApiCollectionResponse<T> {
  data: T[];
}

/** Laravel's default single JsonResource envelope (e.g. GET /api/products/{slug}). */
export interface ApiSingleResponse<T> {
  data: T;
}

/**
 * Laravel's paginate() envelope (e.g. GET /api/articles, /api/courses).
 *
 * `error` distinguishes a genuinely empty page (`error: false`, `data: []`)
 * from a failed request degraded to an empty page (`error: true`) — the
 * fetcher functions returning this type set it, so a listing page can
 * choose between EmptyState ("nothing published yet") and ErrorState
 * ("couldn't reach the API") instead of always showing the same message
 * for both. Callers that don't care (nav/footer/homepage previews) can
 * keep destructuring just `{ data }` — this field is purely additive.
 */
export interface ApiPaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  error?: boolean;
}

export interface ApiFetchOptions extends Omit<RequestInit, "cache"> {
  /**
   * Seconds until Next.js revalidates this request in the background.
   * Pass `false` to opt out of caching entirely (e.g. authenticated or
   * per-submission requests). Defaults to 1 hour — nav/footer content
   * changes rarely.
   */
  revalidate?: number | false;
}

/**
 * Thin wrapper around `fetch` for the Laravel API: resolves the base URL,
 * sets JSON headers, and applies Next.js's fetch-level caching.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { revalidate = 3600, headers, ...init } = options;

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...headers,
    },
    ...(revalidate === false ? { cache: "no-store" as const } : { next: { revalidate } }),
  });

  if (!response.ok) {
    throw new ApiError(`Request to ${path} failed with status ${response.status}`, response.status);
  }

  return response.json() as Promise<T>;
}
