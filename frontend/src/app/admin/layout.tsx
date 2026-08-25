import type { Metadata } from "next";

/**
 * Central Admin Dashboard layout.
 *
 * All /admin/* routes (login, mfa, dashboard, CMS, Expert Pool management,
 * Media Library, Audit Log, etc.) are private staff-only pages that must
 * NOT appear in search engine results — same treatment as /expert-pool.
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
