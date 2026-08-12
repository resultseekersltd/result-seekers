"use client";

import { useEffect } from "react";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Next.js App Router Route-Level Error Boundary.
 *
 * Catches unhandled runtime exceptions during rendering on client or server
 * and displays a user-friendly error UI matching the Result Seekers design
 * system without crashing the whole application.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log exception for diagnostic monitoring
    console.error("Unhandled route error:", error);
  }, [error]);

  return (
    <Section spacing="spacious" className="flex flex-1 flex-col justify-center text-center">
      <div className="mx-auto max-w-md">
        <span className="bg-danger/10 text-danger mx-auto mb-6 flex size-16 items-center justify-center rounded-full">
          <AlertTriangle className="size-8" aria-hidden="true" />
        </span>

        <p className="text-small text-danger font-bold uppercase tracking-wider">
          Unexpected Error
        </p>
        <h1 className="text-display text-foreground mt-2 font-bold tracking-tight">
          Something went wrong
        </h1>
        <p className="text-body-lg text-muted-foreground mt-4">
          An unexpected error occurred while loading this page. Please try again or return to the homepage.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button type="button" onClick={reset} size="lg">
            <RefreshCw className="size-4" aria-hidden="true" />
            Try Again
          </Button>
          <Button href="/" variant="secondary" size="lg">
            <Home className="size-4" aria-hidden="true" />
            Back to Homepage
          </Button>
        </div>
      </div>
    </Section>
  );
}
