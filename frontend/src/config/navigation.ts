/**
 * Static site structure (which pages exist, and their URLs). This is
 * genuinely static — route topology, not editable content — so it lives
 * in the codebase rather than the API. The two dynamic pieces of the
 * primary nav (Solutions and Products dropdowns) are fetched separately
 * from the Laravel API; see src/lib/api/.
 *
 * Source: 03_Feature_Specification.md §15 (Navigation) and §16 (Footer).
 */
export interface NavLink {
  label: string;
  href: string;
}

export interface SocialLink {
  id: string;
  label: string;
  href: string;
}

/** Primary nav links that aren't API-backed dropdowns, in display order. */
export const primaryNavLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Academy", href: "/academy" },
  { label: "Knowledge Centre", href: "/knowledge-centre" },
  { label: "Expert Pool", href: "/expert-network" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

export const primaryCta: NavLink = { label: "Start a Project", href: "/contact" };

export const footerColumns: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Leadership Partners", href: "/leadership-partners" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Knowledge Centre", href: "/knowledge-centre" },
      { label: "Academy", href: "/academy" },
      { label: "Expert Pool", href: "/expert-network" },
      { label: "Expert Portal", href: "/expert-pool/login" },
    ],
  },
];

/**
 * Official Social Profile Links.
 */
export const socialLinks: SocialLink[] = [
  { id: "facebook", label: "Facebook", href: "https://facebook.com" },
  { id: "linkedin", label: "LinkedIn", href: "https://linkedin.com" },
  { id: "instagram", label: "Instagram", href: "https://instagram.com" },
  { id: "twitter", label: "Twitter (X)", href: "https://twitter.com" },
  { id: "whatsapp", label: "WhatsApp", href: "https://whatsapp.com" },
];
