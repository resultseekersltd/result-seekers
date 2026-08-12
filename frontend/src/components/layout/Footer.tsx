"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Section } from "@/components/layout/Section";
import { Logo } from "@/components/layout/Logo";
import { footerColumns, socialLinks } from "@/config/navigation";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { siteConfig } from "@/config/site";
import type { Solution } from "@/types/solution";
import type { Product } from "@/types/product";

interface FooterProps {
  solutions: Solution[];
  products: Product[];
}

const SOCIAL_ICONS: Record<
  string,
  {
    path: string;
    brandColor: string;
    glowColor: string;
    viewBox?: string;
  }
> = {
  facebook: {
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
    brandColor: "#1877F2",
    glowColor: "rgba(24, 119, 242, 0.4)",
  },
  linkedin: {
    path: "M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z",
    brandColor: "#0A66C2",
    glowColor: "rgba(10, 102, 194, 0.4)",
  },
  instagram: {
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
    brandColor: "#E4405F",
    glowColor: "rgba(228, 64, 95, 0.4)",
  },
  twitter: {
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    brandColor: "#1DA1F2",
    glowColor: "rgba(29, 161, 242, 0.4)",
  },
  whatsapp: {
    path: "M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.76.459 3.478 1.33 4.988l-1.416 5.176 5.297-1.389a9.943 9.943 0 004.777 1.218h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.668-1.039-5.176-2.926-7.062a9.923 9.923 0 00-7.065-2.932zm5.882 14.168c-.247.694-1.441 1.325-1.984 1.408-.5.076-1.144.11-1.848-.114a11.516 11.516 0 01-4.045-2.51 12.637 12.637 0 01-2.8-3.486c-.332-.57-.035-.879.213-1.127.222-.222.493-.574.74-.86.247-.285.329-.485.494-.812.164-.329.082-.619-.041-.868-.124-.247-1.111-2.678-1.523-3.666-.401-.962-.808-.831-1.111-.846-.285-.015-.618-.015-.951-.015s-.873.124-1.33.619c-.457.494-1.745 1.706-1.745 4.162s1.786 4.823 2.033 5.153c.247.33 3.513 5.364 8.51 7.522 1.189.513 2.117.82 2.84 1.05.1.032.2.062.3.09.967.308 1.848.264 2.544.16.776-.115 2.385-.975 2.723-1.916.338-.941.338-1.746.238-1.916-.1-.17-.371-.272-.741-.458z",
    brandColor: "#25D366",
    glowColor: "rgba(37, 211, 102, 0.4)",
  },
};

export function Footer({ solutions, products }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border bg-muted border-t">
      <Section spacing="default">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="text-small text-muted-foreground mt-4">{siteConfig.tagline}</p>
            
            {/* Animated Social Media Icons */}
            <div className="mt-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Connect With Us
              </h4>
              <ul className="flex items-center gap-3">
                {socialLinks.map((social) => {
                  const iconConfig = SOCIAL_ICONS[social.id];
                  if (!iconConfig) return null;

                  return (
                    <li key={social.id}>
                      <motion.a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        title={social.label}
                        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border/80 text-muted-foreground transition-all duration-300 shadow-xs cursor-pointer"
                        whileHover={{
                          scale: 1.15,
                          y: -3,
                          backgroundColor: iconConfig.brandColor,
                          borderColor: iconConfig.brandColor,
                          color: "#FFFFFF",
                          boxShadow: `0 10px 25px -4px ${iconConfig.glowColor}`,
                        }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <svg
                          className="h-5 w-5 fill-current transition-transform duration-200"
                          viewBox={iconConfig.viewBox || "0 0 24 24"}
                        >
                          <path d={iconConfig.path} />
                        </svg>
                      </motion.a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <FooterColumn heading={footerColumns[0].heading} links={footerColumns[0].links} />
            <FooterColumn
              heading="Solutions"
              links={solutions.map((solution) => ({
                label: solution.name,
                href: `/solutions/${solution.slug}`,
              }))}
              viewAllHref="/solutions"
            />
            <FooterColumn
              heading="Products"
              links={products.map((product) => ({
                label: product.name,
                href: `/products/${product.slug}`,
              }))}
              viewAllHref="/products"
            />
            <FooterColumn heading={footerColumns[1].heading} links={footerColumns[1].links} />
          </div>
        </div>

        {/* Newsletter subscription form */}
        <NewsletterForm />

        <div className="border-border text-small text-muted-foreground mt-8 border-t pt-6">
          <p>
            &copy; {year} {siteConfig.legalName}. All rights reserved.
          </p>
        </div>
      </Section>
    </footer>
  );
}

function FooterColumn({
  heading,
  links,
  viewAllHref,
}: {
  heading: string;
  links: { label: string; href: string }[];
  viewAllHref?: string;
}) {
  return (
    <div>
      <h3 className="text-small text-foreground font-semibold tracking-wide uppercase">
        {heading}
      </h3>
      <ul className="mt-4 flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-small text-muted-foreground hover:text-primary transition-colors duration-200">
              {link.label}
            </Link>
          </li>
        ))}
        {viewAllHref && (
          <li>
            <Link
              href={viewAllHref}
              className="text-small text-primary font-semibold hover:underline"
            >
              View all
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}
