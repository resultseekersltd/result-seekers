import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/** Generic icon + title + description card — approach/capability highlights, not tied to any one content type. */
export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card>
      <span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-full">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="text-h4 text-foreground mt-4">{title}</p>
      <p className="text-body text-muted-foreground mt-2">{description}</p>
    </Card>
  );
}
