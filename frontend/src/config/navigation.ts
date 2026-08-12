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
 * Social profile links. The specs never provide real URLs for these, so
 * they're placeholders (href "#") until real profile links are supplied —
 * do not invent URLs here.
 */
export const socialLinks: { label: string; href: string }[] = [
  { label: "LinkedIn", href: "#" },
  { label: "X (Twitter)", href: "#" },
  { label: "Facebook", href: "#" },
];
