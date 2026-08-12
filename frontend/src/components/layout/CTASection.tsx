import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";

interface CTAAction {
  label: string;
  href: string;
}

interface CTASectionProps {
  heading: string;
  description?: string;
  primaryAction: CTAAction;
  secondaryAction?: CTAAction;
}

/** Reusable "Final CTA" band — used at the bottom of most pages per the layout principles doc. */
export function CTASection({
  heading,
  description,
  primaryAction,
  secondaryAction,
}: CTASectionProps) {
  return (
    <Section tone="primary" className="relative overflow-hidden">
      {/* Decorative depth overlay — does not affect layout or text */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 60% 50%, rgba(255,255,255,0.07), transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div className="flex flex-col items-center gap-6 text-center">
        <h2 className="text-display max-w-2xl">{heading}</h2>
        {description && (
          <p className="text-body-lg text-primary-foreground/85 max-w-2xl">{description}</p>
        )}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href={primaryAction.href} variant="inverse" size="lg">
            {primaryAction.label}
          </Button>
          {secondaryAction && (
            <Button
              href={secondaryAction.href}
              variant="ghost"
              size="lg"
              className="text-primary-foreground! hover:bg-neutral-white/10!"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </Section>
  );
}
