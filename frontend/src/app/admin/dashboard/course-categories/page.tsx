"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";
import { COURSE_CATEGORIES_CONFIG } from "@/components/admin/resource-configs";

export default function AdminCourseCategoriesPage() {
  return <ResourceManager config={COURSE_CATEGORIES_CONFIG} />;
}
