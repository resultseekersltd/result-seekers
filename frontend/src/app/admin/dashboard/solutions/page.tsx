"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";
import { SOLUTIONS_CONFIG } from "@/components/admin/resource-configs";

export default function AdminSolutionsPage() {
  return <ResourceManager config={SOLUTIONS_CONFIG} />;
}
