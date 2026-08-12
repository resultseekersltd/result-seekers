import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  heading: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

/** Section label + heading + supporting description, per "Section Standards" (design doc §25). */
export function SectionHeader({
  eyebrow,
  heading,
  description,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <>
          <div className="bg-accent h-0.5 w-8 rounded-full" aria-hidden="true" />
          <p className="text-small text-accent mt-3 font-semibold tracking-wide uppercase">{eyebrow}</p>
        </>
      )}
      <h2 className={cn("text-display text-foreground", eyebrow && "mt-3")}>{heading}</h2>
      {description && <p className="text-body-lg text-muted-foreground mt-4">{description}</p>}
    </div>
  );
}
