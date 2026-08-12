import Link from "next/link";
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

export function Footer({ solutions, products }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border bg-muted border-t">
      <Section spacing="default">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="text-small text-muted-foreground mt-4">{siteConfig.tagline}</p>
            <ul className="mt-6 flex gap-4">
              {socialLinks.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    className="text-small text-muted-foreground hover:text-primary"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
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
            <Link href={link.href} className="text-small text-muted-foreground hover:text-primary">
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
