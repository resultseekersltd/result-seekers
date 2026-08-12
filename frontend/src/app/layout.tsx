import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSolutions } from "@/lib/api/solutions";
import { getProducts } from "@/lib/api/products";
import { siteConfig } from "@/config/site";
import { env } from "@/lib/env";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "research",
    "monitoring and evaluation",
    "M&E",
    "data",
    "AI",
    "geospatial",
    "GIS",
    "software engineering",
    "capacity development",
    "digital transformation",
    "evidence",
    "impact",
    "development",
    "Nigeria",
  ],
  authors: [{ name: siteConfig.legalName }],
  creator: siteConfig.legalName,
  publisher: siteConfig.legalName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    creator: siteConfig.legalName,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

/** Organization + WebSite structured data — uses only real project data. */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  legalName: siteConfig.legalName,
  url: env.siteUrl,
  description: siteConfig.description,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: env.siteUrl,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetched once here (rather than per-page) since the navbar and footer
  // are shared chrome. Both fetchers fall back to [] on failure, so a
  // backend outage degrades the nav to plain links instead of crashing
  // the whole site — see src/lib/api/solutions.ts and products.ts.
  const [solutions, products] = await Promise.all([getSolutions(), getProducts()]);

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="bg-background text-foreground flex min-h-full flex-col font-sans">
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={websiteJsonLd} />
        <a
          href="#main-content"
          className="focus:rounded-button focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <Navbar solutions={solutions} products={products} />
        <main id="main-content" className="flex flex-1 flex-col">
          {children}
        </main>
        <Footer solutions={solutions} products={products} />
      </body>
    </html>
  );
}
