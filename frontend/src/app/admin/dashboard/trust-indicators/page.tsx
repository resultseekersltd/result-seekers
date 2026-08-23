"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";
import { TRUST_INDICATORS_CONFIG } from "@/components/admin/resource-configs";

export default function AdminTrustIndicatorsPage() {
  return <ResourceManager config={TRUST_INDICATORS_CONFIG} />;
}
