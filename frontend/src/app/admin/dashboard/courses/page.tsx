"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";
import { COURSES_CONFIG } from "@/components/admin/resource-configs";

export default function AdminCoursesPage() {
  return <ResourceManager config={COURSES_CONFIG} />;
}
