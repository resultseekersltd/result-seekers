"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";
import { TEAM_MEMBERS_CONFIG } from "@/components/admin/resource-configs";

export default function AdminTeamMembersPage() {
  return <ResourceManager config={TEAM_MEMBERS_CONFIG} />;
}
