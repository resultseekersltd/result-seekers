"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";
import { PRODUCTS_CONFIG } from "@/components/admin/resource-configs";

export default function AdminProductsPage() {
  return <ResourceManager config={PRODUCTS_CONFIG} />;
}
