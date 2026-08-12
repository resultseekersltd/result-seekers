/**
 * Mirrors the `team_members` table (backend: app/Models/TeamMember.php).
 * No public API endpoint exists for this yet (Backend Phase 2 covered
 * Solutions/Products/Articles/Courses only) — declared now so TeamCard has
 * a real contract to render against once one does.
 */
export interface TeamMember {
  id: number;
  name: string;
  roleTitle: string;
  bio: string | null;
  photoPath: string | null;
}
