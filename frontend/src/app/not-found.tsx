import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { FileQuestion, Home } from "lucide-react";

/**
 * Root 404 Not Found Page.
 *
 * Rendered whenever a route is not found or when `notFound()` is called in
 * any page or layout across the application.
 */
export default function NotFound() {
  return (
    <Section spacing="spacious" className="flex flex-1 flex-col justify-center text-center">
      <div className="mx-auto max-w-md">
        <span className="bg-primary/10 text-primary mx-auto mb-6 flex size-16 items-center justify-center rounded-full">
          <FileQuestion className="size-8" aria-hidden="true" />
        </span>

        <p className="text-small text-primary font-bold uppercase tracking-wider">
          404 Error
        </p>
        <h1 className="text-display text-foreground mt-2 font-bold tracking-tight">
          Page Not Found
        </h1>
        <p className="text-body-lg text-muted-foreground mt-4">
          The page you are looking for doesn&apos;t exist or may have been moved. Please check the URL or return to the homepage.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button href="/" size="lg">
            <Home className="size-4" aria-hidden="true" />
            Back to Homepage
          </Button>
          <Button href="/solutions" variant="secondary" size="lg">
            Explore Solutions
          </Button>
        </div>
      </div>
    </Section>
  );
}
