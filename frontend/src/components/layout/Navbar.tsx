"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";
import { NavDropdown, type NavDropdownItem } from "@/components/layout/NavDropdown";
import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { primaryCta, primaryNavLinks } from "@/config/navigation";
import type { Solution } from "@/types/solution";
import type { Product } from "@/types/product";

interface NavbarProps {
  solutions: Solution[];
  products: Product[];
}

const LINKS_BEFORE_DROPDOWNS = primaryNavLinks.slice(0, 2); // Home, About
const LINKS_AFTER_DROPDOWNS = primaryNavLinks.slice(2); // Academy, Knowledge Centre, Expert Pool, Careers, Contact

const LINK_CLASSES =
  "rounded-md px-3 py-2 text-small font-medium text-foreground transition-colors hover:text-primary";

export function Navbar({ solutions, products }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const solutionItems: NavDropdownItem[] = solutions.map((solution) => ({
    label: solution.name,
    href: `/solutions/${solution.slug}`,
  }));
  const productItems: NavDropdownItem[] = products.map((product) => ({
    label: product.name,
    href: `/products/${product.slug}`,
  }));

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,box-shadow,border-color] duration-200",
        scrolled
          ? "border-border bg-background/95 shadow-soft backdrop-blur-sm"
          : "bg-background border-transparent",
      )}
    >
      <Container className="flex h-16 items-center justify-between md:h-20">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {LINKS_BEFORE_DROPDOWNS.map((link) => (
            <Link key={link.href} href={link.href} className={LINK_CLASSES}>
              {link.label}
            </Link>
          ))}
          <NavDropdown label="Solutions" href="/solutions" items={solutionItems} />
          <NavDropdown label="Products" href="/products" items={productItems} />
          {LINKS_AFTER_DROPDOWNS.map((link) => (
            <Link key={link.href} href={link.href} className={LINK_CLASSES}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button href={primaryCta.href} size="sm">
            {primaryCta.label}
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-dialog"
          className="text-foreground hover:bg-muted active:scale-95 rounded-lg p-2 transition-transform cursor-pointer md:hidden"
        >
          <Menu className="size-6" aria-hidden="true" />
        </button>
      </Container>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        solutions={solutionItems}
        products={productItems}
      />
    </header>
  );
}
