import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  photoPath?: string | null;
  size?: "md" | "lg";
  className?: string;
}

const SIZES = {
  md: "size-14 text-body",
  lg: "size-20 text-h4",
} as const;

/** Circular photo, or initials on a muted background when no photo exists — shared by TeamCard and PartnerCard. */
export function Avatar({ name, photoPath, size = "lg", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "bg-muted text-muted-foreground flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        SIZES[size],
        className,
      )}
    >
      {photoPath ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoPath} alt="" className="size-full object-cover" />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
