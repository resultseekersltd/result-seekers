"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";
import { ARTICLES_CONFIG } from "@/components/admin/resource-configs";

export default function AdminArticlesPage() {
  return <ResourceManager config={ARTICLES_CONFIG} />;
}
