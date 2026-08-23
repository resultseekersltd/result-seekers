"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";
import { ARTICLE_CATEGORIES_CONFIG } from "@/components/admin/resource-configs";

export default function AdminArticleCategoriesPage() {
  return <ResourceManager config={ARTICLE_CATEGORIES_CONFIG} />;
}
