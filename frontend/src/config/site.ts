/**
 * Static brand/site configuration — values that are part of the codebase,
 * not editable content. Editable content (products, solutions, stats,
 * insights, courses, etc.) is fetched from the Laravel API instead; see
 * `src/lib/env.ts` for the API base URL.
 *
 * Copy sourced verbatim from 05_Content_and_Product_Specification.md
 * ("Company Overview" / "Tagline" / "Elevator Pitch").
 */
export const siteConfig = {
  name: "Result Seekers",
  legalName: "Result Seekers Ltd",
  tagline: "Evidence. Intelligence. Innovation. Impact.",
  description:
    "Result Seekers partners with organizations to transform data into decisions, ideas into digital solutions, and knowledge into measurable impact. We combine research, monitoring and evaluation, artificial intelligence, geospatial technologies, software engineering, and capacity development to solve complex development and business challenges across humanitarian, government, education, and private sector environments.",
  /** Company Positioning, doc 05 §2 — verbatim. */
  positioningStatement:
    "Result Seekers is an evidence, intelligence, research, monitoring & evaluation, technology, AI, GIS, digital transformation, software engineering, and capacity development company. We help governments, development partners, NGOs, educational institutions, and private sector organizations make better decisions through evidence, technology, and innovation.",
  primaryCta: "Start a Project",
} as const;

/** Core Values, doc 05 §4 — the complete approved list, verbatim. */
export const coreValues = [
  "Integrity",
  "Excellence",
  "Innovation",
  "Collaboration",
  "Evidence-Based Decision Making",
  "Accountability",
  "Continuous Learning",
  "Professionalism",
  "Client-Centred Service",
  "Sustainable Impact",
] as const;
