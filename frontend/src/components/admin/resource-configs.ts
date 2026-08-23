import type { ResourceConfig } from "@/components/admin/resource-config";

export const SOLUTIONS_CONFIG: ResourceConfig = {
  resource: "solutions",
  label: "Solutions",
  singularLabel: "Solution",
  hasShow: true,
  identifierKey: "slug",
  columns: [
    { key: "name", label: "Name" },
    { key: "slug", label: "Slug" },
    { key: "order", label: "Order" },
    { key: "isActive", label: "Active" },
  ],
  defaults: { is_active: true, order: 0, services: [], outputs: [], tools: [] },
  fields: [
    { type: "text", name: "name", label: "Name", required: true },
    { type: "text", name: "slug", label: "Slug", required: true },
    { type: "textarea", name: "summary", label: "Summary", required: true },
    { type: "text", name: "icon", label: "Icon" },
    { type: "text", name: "hero_heading", label: "Hero Heading" },
    { type: "textarea", name: "hero_description", label: "Hero Description" },
    { type: "textarea", name: "problem_statement", label: "Problem Statement" },
    { type: "textarea", name: "our_approach", label: "Our Approach" },
    { type: "taglist", name: "services", label: "Services" },
    { type: "taglist", name: "outputs", label: "Outputs" },
    { type: "taglist", name: "tools", label: "Tools" },
    { type: "number", name: "order", label: "Order" },
    { type: "checkbox", name: "is_active", label: "Active" },
  ],
};

export const PRODUCTS_CONFIG: ResourceConfig = {
  resource: "products",
  label: "Products",
  singularLabel: "Product",
  hasShow: true,
  identifierKey: "slug",
  columns: [
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "status", label: "Status" },
    { key: "isActive", label: "Active" },
  ],
  defaults: { is_active: true, order: 0, status: "operational", target_users: [], features: [] },
  fields: [
    { type: "text", name: "name", label: "Name", required: true },
    { type: "text", name: "slug", label: "Slug", required: true },
    { type: "text", name: "category", label: "Category", required: true },
    { type: "text", name: "short_description", label: "Short Description", required: true },
    { type: "textarea", name: "description", label: "Description", required: true },
    {
      type: "select",
      name: "status",
      label: "Status",
      required: true,
      options: [
        { value: "operational", label: "Operational" },
        { value: "under_development", label: "Under Development" },
        { value: "concept", label: "Concept" },
        { value: "coming_soon", label: "Coming Soon" },
      ],
    },
    { type: "text", name: "external_url", label: "External URL" },
    { type: "taglist", name: "target_users", label: "Target Users" },
    { type: "taglist", name: "features", label: "Features" },
    { type: "text", name: "logo_path", label: "Logo Path" },
    { type: "number", name: "order", label: "Order" },
    { type: "checkbox", name: "is_active", label: "Active" },
  ],
};

export const ARTICLE_CATEGORIES_CONFIG: ResourceConfig = {
  resource: "article-categories",
  label: "Article Categories",
  singularLabel: "Category",
  hasShow: false,
  identifierKey: "slug",
  columns: [
    { key: "name", label: "Name" },
    { key: "slug", label: "Slug" },
    { key: "order", label: "Order" },
  ],
  defaults: { order: 0 },
  fields: [
    { type: "text", name: "name", label: "Name", required: true },
    { type: "text", name: "slug", label: "Slug", required: true },
    { type: "number", name: "order", label: "Order" },
  ],
};

export const TAGS_CONFIG: ResourceConfig = {
  resource: "tags",
  label: "Tags",
  singularLabel: "Tag",
  hasShow: false,
  identifierKey: "slug",
  columns: [
    { key: "name", label: "Name" },
    { key: "slug", label: "Slug" },
  ],
  fields: [
    { type: "text", name: "name", label: "Name", required: true },
    { type: "text", name: "slug", label: "Slug", required: true },
  ],
};

export const ARTICLES_CONFIG: ResourceConfig = {
  resource: "articles",
  label: "Articles",
  singularLabel: "Article",
  hasShow: true,
  identifierKey: "slug",
  columns: [
    { key: "title", label: "Title" },
    { key: "status", label: "Status" },
    { key: "authorName", label: "Author" },
    { key: "isFeatured", label: "Featured" },
  ],
  defaults: { status: "draft", is_featured: false, tag_ids: [], solution_ids: [] },
  fields: [
    { type: "text", name: "title", label: "Title", required: true },
    { type: "text", name: "slug", label: "Slug", required: true },
    {
      type: "relation-select",
      name: "article_category_id",
      label: "Category",
      required: true,
      resource: "article-categories",
      optionLabelKey: "name",
    },
    { type: "textarea", name: "summary", label: "Summary", required: true },
    { type: "textarea", name: "content", label: "Content", required: true },
    { type: "text", name: "author_name", label: "Author Name", required: true },
    { type: "text", name: "author_title", label: "Author Title" },
    { type: "text", name: "cover_image_path", label: "Cover Image Path" },
    { type: "number", name: "reading_time_minutes", label: "Reading Time (minutes)" },
    {
      type: "select",
      name: "status",
      label: "Status",
      required: true,
      options: [
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published" },
      ],
    },
    { type: "date", name: "published_at", label: "Published At" },
    { type: "checkbox", name: "is_featured", label: "Featured" },
    {
      type: "relation-multiselect",
      name: "tag_ids",
      label: "Tags",
      resource: "tags",
      optionLabelKey: "name",
    },
    {
      type: "relation-multiselect",
      name: "solution_ids",
      label: "Related Solutions",
      resource: "solutions",
      optionLabelKey: "name",
    },
  ],
};

export const COURSE_CATEGORIES_CONFIG: ResourceConfig = {
  resource: "course-categories",
  label: "Course Categories",
  singularLabel: "Category",
  hasShow: false,
  identifierKey: "slug",
  columns: [
    { key: "name", label: "Name" },
    { key: "slug", label: "Slug" },
    { key: "order", label: "Order" },
  ],
  defaults: { order: 0 },
  fields: [
    { type: "text", name: "name", label: "Name", required: true },
    { type: "text", name: "slug", label: "Slug", required: true },
    { type: "number", name: "order", label: "Order" },
  ],
};

export const COURSES_CONFIG: ResourceConfig = {
  resource: "courses",
  label: "Courses",
  singularLabel: "Course",
  hasShow: true,
  identifierKey: "slug",
  columns: [
    { key: "title", label: "Title" },
    { key: "track", label: "Track" },
    { key: "status", label: "Status" },
    { key: "isFeatured", label: "Featured" },
  ],
  defaults: { status: "draft", is_featured: false, order: 0 },
  fields: [
    { type: "text", name: "title", label: "Title", required: true },
    { type: "text", name: "slug", label: "Slug", required: true },
    {
      type: "relation-select",
      name: "course_category_id",
      label: "Category",
      required: true,
      resource: "course-categories",
      optionLabelKey: "name",
    },
    { type: "textarea", name: "summary", label: "Summary", required: true },
    { type: "textarea", name: "description", label: "Description" },
    {
      type: "select",
      name: "track",
      label: "Track",
      options: [
        { value: "corporate", label: "Corporate" },
        { value: "professional", label: "Professional" },
        { value: "youth", label: "Youth" },
      ],
    },
    {
      type: "select",
      name: "delivery_mode",
      label: "Delivery Mode",
      options: [
        { value: "in_person", label: "In Person" },
        { value: "online", label: "Online" },
        { value: "hybrid", label: "Hybrid" },
      ],
    },
    { type: "text", name: "duration_text", label: "Duration" },
    {
      type: "select",
      name: "status",
      label: "Status",
      required: true,
      options: [
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published" },
      ],
    },
    { type: "checkbox", name: "is_featured", label: "Featured" },
    { type: "number", name: "order", label: "Order" },
  ],
};

export const TRUST_INDICATORS_CONFIG: ResourceConfig = {
  resource: "trust-indicators",
  label: "Trust Indicators",
  singularLabel: "Indicator",
  hasShow: false,
  columns: [
    { key: "label", label: "Label" },
    { key: "type", label: "Type" },
    { key: "value", label: "Value" },
    { key: "order", label: "Order" },
  ],
  defaults: { type: "numeric", order: 0, is_active: true },
  fields: [
    {
      type: "select",
      name: "type",
      label: "Type",
      required: true,
      options: [
        { value: "numeric", label: "Numeric" },
        { value: "qualitative", label: "Qualitative" },
      ],
    },
    { type: "number", name: "value", label: "Value" },
    { type: "text", name: "suffix", label: "Suffix (e.g. +, %)" },
    { type: "text", name: "label", label: "Label", required: true },
    { type: "number", name: "order", label: "Order" },
    { type: "checkbox", name: "is_active", label: "Active" },
  ],
};

export const TEAM_MEMBERS_CONFIG: ResourceConfig = {
  resource: "team-members",
  label: "Team Members",
  singularLabel: "Team Member",
  hasShow: false,
  columns: [
    { key: "name", label: "Name" },
    { key: "roleTitle", label: "Role" },
    { key: "order", label: "Order" },
    { key: "isActive", label: "Active" },
  ],
  defaults: { order: 0, is_active: true },
  fields: [
    { type: "text", name: "name", label: "Name", required: true },
    { type: "text", name: "role_title", label: "Role Title", required: true },
    { type: "textarea", name: "bio", label: "Bio" },
    { type: "text", name: "photo_path", label: "Photo Path" },
    { type: "number", name: "order", label: "Order" },
    { type: "checkbox", name: "is_active", label: "Active" },
  ],
};

export const LEADERSHIP_PARTNERS_CONFIG: ResourceConfig = {
  resource: "strategic-leadership-partners",
  label: "Strategic Leadership Partners",
  singularLabel: "Partner",
  hasShow: false,
  columns: [
    { key: "fullName", label: "Name" },
    { key: "headline", label: "Headline" },
    { key: "isPublished", label: "Published" },
    { key: "order", label: "Order" },
  ],
  defaults: { order: 0, is_published: false },
  fields: [
    { type: "text", name: "full_name", label: "Full Name", required: true },
    { type: "text", name: "headline", label: "Headline" },
    { type: "textarea", name: "bio", label: "Bio" },
    { type: "text", name: "photo_path", label: "Photo Path" },
    { type: "text", name: "linkedin_url", label: "LinkedIn URL" },
    { type: "checkbox", name: "is_published", label: "Published" },
    { type: "number", name: "order", label: "Order" },
  ],
};

export const OFFICES_CONFIG: ResourceConfig = {
  resource: "offices",
  label: "Offices",
  singularLabel: "Office",
  hasShow: false,
  columns: [
    { key: "name", label: "Name" },
    { key: "city", label: "City" },
    { key: "isHeadquarters", label: "HQ" },
    { key: "order", label: "Order" },
  ],
  defaults: { order: 0, is_headquarters: false },
  fields: [
    { type: "text", name: "name", label: "Name", required: true },
    { type: "text", name: "city", label: "City" },
    { type: "text", name: "state", label: "State" },
    { type: "textarea", name: "address", label: "Address" },
    { type: "text", name: "phone", label: "Phone" },
    { type: "text", name: "email", label: "Email" },
    { type: "number", name: "latitude", label: "Latitude" },
    { type: "number", name: "longitude", label: "Longitude" },
    { type: "checkbox", name: "is_headquarters", label: "Headquarters" },
    { type: "number", name: "order", label: "Order" },
  ],
};

export const VACANCIES_CONFIG: ResourceConfig = {
  resource: "vacancies",
  label: "Vacancies",
  singularLabel: "Vacancy",
  hasShow: false,
  identifierKey: "slug",
  columns: [
    { key: "title", label: "Title" },
    { key: "type", label: "Type" },
    { key: "status", label: "Status" },
    { key: "isFeatured", label: "Featured" },
  ],
  defaults: { type: "vacancy", status: "draft", is_featured: false, order: 0, requirements: [] },
  fields: [
    { type: "text", name: "title", label: "Title", required: true },
    { type: "text", name: "slug", label: "Slug", required: true },
    {
      type: "select",
      name: "type",
      label: "Type",
      required: true,
      options: [
        { value: "vacancy", label: "Current Vacancy" },
        { value: "graduate_programme", label: "Graduate Programme" },
        { value: "internship", label: "Internship" },
      ],
    },
    { type: "text", name: "department", label: "Department" },
    { type: "text", name: "location", label: "Location" },
    { type: "textarea", name: "summary", label: "Summary", required: true },
    { type: "textarea", name: "description", label: "Description" },
    { type: "taglist", name: "requirements", label: "Requirements" },
    { type: "date", name: "application_deadline", label: "Application Deadline" },
    {
      type: "select",
      name: "status",
      label: "Status",
      required: true,
      options: [
        { value: "draft", label: "Draft" },
        { value: "open", label: "Open" },
        { value: "closed", label: "Closed" },
      ],
    },
    { type: "checkbox", name: "is_featured", label: "Featured" },
    { type: "number", name: "order", label: "Order" },
  ],
};
