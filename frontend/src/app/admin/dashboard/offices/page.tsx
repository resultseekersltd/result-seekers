"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";
import { OFFICES_CONFIG } from "@/components/admin/resource-configs";

export default function AdminOfficesPage() {
  return <ResourceManager config={OFFICES_CONFIG} />;
}
