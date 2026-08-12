/**
 * Mirrors the `strategic_leadership_partners` table (backend:
 * app/Models/StrategicLeadershipPartner.php). No public API endpoint
 * exists for this yet — declared now so PartnerCard has a real contract
 * to render against once one does.
 */
export interface Partner {
  id: number;
  fullName: string;
  headline: string | null;
  bio: string | null;
  photoPath: string | null;
  linkedinUrl: string | null;
}
