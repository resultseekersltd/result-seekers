/**
 * Centralised, typed access to environment variables so the rest of the
 * app never reads `process.env` directly. Values fall back to local
 * development defaults; production deployments must set these explicitly.
 */

function readEnv(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

export const env = {
  /** Public site origin, used for metadataBase, canonical URLs, sitemap, JSON-LD. */
  siteUrl: readEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000"),
  /** Base URL of the Laravel API (e.g. https://api.resultseekers.com/api). */
  apiUrl: readEnv("NEXT_PUBLIC_API_URL", "http://localhost:8000/api"),
} as const;
