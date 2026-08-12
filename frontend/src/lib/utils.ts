type ClassValue = string | number | null | boolean | undefined | ClassValue[];

function flattenClasses(value: ClassValue, out: string[]): void {
  if (!value && value !== 0) return;
  if (Array.isArray(value)) {
    for (const item of value) flattenClasses(item, out);
    return;
  }
  out.push(String(value));
}

/**
 * Joins conditional class names together, skipping falsy values and
 * flattening nested arrays. Kept dependency-free (no clsx/tailwind-merge)
 * per the approved dependency list — call sites are expected to avoid
 * passing genuinely conflicting utility classes.
 */
export function cn(...values: ClassValue[]): string {
  const out: string[] = [];
  flattenClasses(values, out);
  return out.join(" ");
}

/** "14 January 2026" — shared by ArticleCard and the Article Detail Page. */
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
