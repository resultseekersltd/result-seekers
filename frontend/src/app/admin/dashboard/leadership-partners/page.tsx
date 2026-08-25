"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";
import { LEADERSHIP_PARTNERS_CONFIG } from "@/components/admin/resource-configs";

export default function AdminLeadershipPartnersPage() {
  return <ResourceManager config={LEADERSHIP_PARTNERS_CONFIG} />;
}
