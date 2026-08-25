/**
 * Field-schema types driving the generic admin CMS UI (ResourceManager +
 * ResourceForm). One config per content type describes its list columns
 * and its create/edit form fields — the UI itself is written once and
 * reused across all twelve CMS content types instead of building near-
 * duplicate pages per type.
 */

export type FieldSchema =
  | { type: "text"; name: string; label: string; required?: boolean }
  | { type: "textarea"; name: string; label: string; required?: boolean }
  | { type: "number"; name: string; label: string; required?: boolean }
  | { type: "checkbox"; name: string; label: string }
  | { type: "date"; name: string; label: string; required?: boolean }
  | { type: "select"; name: string; label: string; required?: boolean; options: { value: string; label: string }[] }
  | {
      type: "relation-select";
      name: string;
      label: string;
      required?: boolean;
      /** Admin CMS resource slug to fetch options from, e.g. "article-categories". */
      resource: string;
      optionLabelKey: string;
      optionValueKey?: string;
    }
  | {
      type: "relation-multiselect";
      name: string;
      label: string;
      resource: string;
      optionLabelKey: string;
      optionValueKey?: string;
    }
  | { type: "taglist"; name: string; label: string; description?: string };

export interface ResourceColumn {
  key: string;
  label: string;
}

export interface ResourceConfig {
  /** Admin CMS resource slug — matches the Laravel route segment, e.g. "article-categories". */
  resource: string;
  label: string;
  singularLabel: string;
  columns: ResourceColumn[];
  fields: FieldSchema[];
  /** Whether the API exposes GET /cms/{resource}/{id} — if false, the edit modal is pre-filled from the already-fetched list row instead. */
  hasShow: boolean;
  /** Default values merged into a blank "New" form. */
  defaults?: Record<string, unknown>;
  /**
   * Which field identifies a row in update/delete URLs. Most models use
   * Laravel's default numeric `id` route-model-binding, but Solution,
   * Product, Article, ArticleCategory, Tag, Course, CourseCategory, and
   * Vacancy all override `getRouteKeyName()` to `slug` (so their public
   * URLs read nicely, e.g. /products/result-campus) — the admin routes
   * for those same models inherit that binding too. Defaults to "id".
   */
  identifierKey?: "id" | "slug";
}
