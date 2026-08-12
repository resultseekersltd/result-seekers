import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

/**
 * Next.js App Router robots.txt generation.
 *
 * Rules:
 *  - Public marketing pages → crawlable (including /expert-network)
 *  - /api/* BFF routes → not indexed
 *  - /expert-pool and all sub-routes → not indexed
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/expert-pool", "/expert-pool/"],
      },
    ],
    sitemap: `${env.siteUrl}/sitemap.xml`,
  };
}
