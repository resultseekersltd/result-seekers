"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";
import { VACANCIES_CONFIG } from "@/components/admin/resource-configs";

export default function AdminVacanciesPage() {
  return <ResourceManager config={VACANCIES_CONFIG} />;
}
