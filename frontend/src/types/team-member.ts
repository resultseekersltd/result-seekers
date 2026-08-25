/**
 * Mirrors the `team_members` table and TeamMemberResource (backend:
 * app/Models/TeamMember.php, app/Http/Resources/TeamMemberResource.php).
 * The public GET /api/team-members endpoint (Task 014) finally gives
 * TeamCard a real data source — see components/sections/TeamSection.tsx.
 */
export interface TeamMember {
  id: number;
  name: string;
  roleTitle: string;
  bio: string | null;
  photoPath: string | null;
  order: number;
  isActive: boolean;
}
