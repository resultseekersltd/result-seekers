import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Shown while the homepage's server-side data fetches (Solutions,
 * Products, Courses, Articles, categories) are in flight — Next.js's
 * route-level Suspense boundary, not a client-side spinner.
 */
export default function Loading() {
  return (
    <div className="py-12 md:py-16 lg:py-20">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <Skeleton className="h-4 w-64" />
          <Skeleton className="mt-4 h-14 w-full max-w-xl" />
          <Skeleton className="mt-3 h-14 w-3/4 max-w-xl" />
          <Skeleton className="mt-6 h-24 w-full max-w-lg" />
          <div className="mt-8 flex gap-3">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
        <Skeleton className="h-80 w-full" />
      </Container>
    </div>
  );
}
