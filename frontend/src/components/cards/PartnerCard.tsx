import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { TextLink } from "@/components/ui/TextLink";
import type { Partner } from "@/types/partner";

interface PartnerCardProps {
  partner: Pick<Partner, "fullName" | "headline" | "bio" | "photoPath" | "linkedinUrl">;
}

export function PartnerCard({ partner }: PartnerCardProps) {
  return (
    <Card className="flex flex-col items-center text-center">
      <Avatar name={partner.fullName} photoPath={partner.photoPath} size="lg" />
      <p className="text-h4 text-foreground mt-4">{partner.fullName}</p>
      {partner.headline && <p className="text-small text-muted-foreground">{partner.headline}</p>}
      {partner.bio && <p className="text-body text-muted-foreground mt-3">{partner.bio}</p>}
      {partner.linkedinUrl && (
        <TextLink
          href={partner.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3"
        >
          LinkedIn
        </TextLink>
      )}
    </Card>
  );
}
