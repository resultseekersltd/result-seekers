import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Official Result Seekers logomark (public/logo.png). Deliberately a plain
 * <img>, not next/image: we don't know the source file's exact pixel
 * dimensions, and a plain <img> with only a height class preserves its
 * native aspect ratio automatically — a hardcoded width/height guess could
 * silently stretch or squash it. `h-auto w-auto` + a fixed height keeps it
 * crisp and undistorted at every navbar/footer size.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Result Seekers home"
      className={cn("inline-flex items-center", className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Result Seekers" className="h-10 w-auto md:h-12" />
    </Link>
  );
}
