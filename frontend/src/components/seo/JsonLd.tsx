/**
 * Safely renders a JSON-LD structured data block.
 *
 * Using JSON.stringify with __html is the Next.js-recommended way to embed
 * JSON-LD — `JSON.stringify` escapes characters that are dangerous inside a
 * <script> tag (e.g. "</script>"), making this XSS-safe for the structured
 * data use case.
 *
 * Ref: https://nextjs.org/docs/app/building-your-application/optimizing/metadata#json-ld
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
