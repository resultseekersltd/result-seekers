"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";
import { TAGS_CONFIG } from "@/components/admin/resource-configs";

export default function AdminTagsPage() {
  return <ResourceManager config={TAGS_CONFIG} />;
}
