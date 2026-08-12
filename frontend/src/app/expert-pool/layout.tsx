import type { Metadata } from "next";

/**
 * Expert Pool portal layout.
 *
 * All /expert-pool/* routes (login, register, verify-email, mfa, forgot-
 * password, reset-password, dashboard, etc.) are private portal pages that
 * must NOT appear in search engine results.
 *
 * This server layout applies a site-wide noindex to all expert-pool routes.
 * The public /expert-network page is a separate route and is unaffected.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function ExpertPoolLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
