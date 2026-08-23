import type { Metadata } from "next";

/**
 * Organisation portal layout — mirrors expert-pool/layout.tsx exactly.
 * All /organisation/* routes are private and must not appear in search results.
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

export default function OrganisationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
