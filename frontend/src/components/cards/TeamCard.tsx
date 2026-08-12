import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import type { TeamMember } from "@/types/team-member";

interface TeamCardProps {
  member: Pick<TeamMember, "name" | "roleTitle" | "bio" | "photoPath">;
}

export function TeamCard({ member }: TeamCardProps) {
  return (
    <Card className="flex flex-col items-center text-center">
      <Avatar name={member.name} photoPath={member.photoPath} size="lg" />
      <p className="text-h4 text-foreground mt-4">{member.name}</p>
      <p className="text-small text-muted-foreground">{member.roleTitle}</p>
      {member.bio && <p className="text-body text-muted-foreground mt-3">{member.bio}</p>}
    </Card>
  );
}
