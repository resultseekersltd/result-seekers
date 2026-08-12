import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TextLink } from "@/components/ui/TextLink";
import { cn } from "@/lib/utils";
import type { Solution } from "@/types/solution";

interface SolutionCardProps {
  solution: Pick<Solution, "slug" | "name" | "summary">;
  /**
   * The API returns `icon` as a string key (or null); resolving that string
   * to an actual Lucide component is a page-level concern (the calling
   * page owns the string→icon lookup map), so this just renders whichever
   * icon it's given.
   */
  icon?: LucideIcon;
}

/** Design doc §27: icon, title, summary, Learn More button, hover animation. */
export function SolutionCard({ solution, icon: Icon }: SolutionCardProps) {
  return (
    <Card hoverable className="flex h-full flex-col">
      {Icon && (
        <span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-full">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      )}
      <p className={cn("text-h4 text-foreground", Icon && "mt-4")}>{solution.name}</p>
      <p className="text-body text-muted-foreground mt-2 flex-1">{solution.summary}</p>
      <TextLink href={`/solutions/${solution.slug}`} withArrow className="mt-4">
        Learn More
      </TextLink>
    </Card>
  );
}
