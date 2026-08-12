import { Quote } from "lucide-react";
import { Card } from "@/components/ui/Card";

/**
 * Stand-in for the testimonials section until real, approved client quotes
 * exist — per the master prompt's content rule, testimonials must never be
 * fabricated. Clearly labelled rather than left as empty white space.
 */
export function TestimonialPlaceholder() {
  return (
    <Card className="text-muted-foreground flex flex-col items-center gap-3 border-dashed text-center">
      <Quote className="size-8" aria-hidden="true" />
      <p className="text-body-lg">Client testimonials will appear here as they become available.</p>
    </Card>
  );
}
