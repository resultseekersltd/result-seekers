import type { Metadata } from "next";
import { FileCheck, ShieldCheck, ClipboardCheck, Database } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { CTASection } from "@/components/layout/CTASection";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Expert Pool",
  description:
    "A nationwide pool of vetted professionals available for project staffing, consultancy opportunities, and rapid deployment.",
  alternates: {
    canonical: "/expert-network",
  },
  openGraph: {
    title: "Expert Pool | Result Seekers",
    description:
      "A nationwide pool of vetted professionals available for project staffing, consultancy opportunities, and rapid deployment.",
    url: "/expert-network",
  },
};

/** Verbatim from the disciplines list already approved for NetworkPreview.tsx's description. */
const DISCIPLINES = ["Research", "Monitoring & Evaluation", "GIS", "AI", "Software Engineering"] as const;

/**
 * Expert Pool Application Workflow: Submit profile → Verification → Review → Approval & Inclusion.
 */
const WORKFLOW_STEPS = [
  { icon: FileCheck, title: "Submit Profile", description: "Share your background, discipline, and experience." },
  { icon: ShieldCheck, title: "Verification", description: "Credentials and experience are checked." },
  { icon: ClipboardCheck, title: "Review", description: "Your profile is assessed against current needs." },
  { icon: Database, title: "Approval & Inclusion", description: "Approved profiles join the expert pool." },
] as const;

export default function ExpertNetworkPage() {
  return (
    <>
      <PageHeader
        title="Expert Pool"
        description="A nationwide pool of vetted professionals available for project staffing, consultancy opportunities, and rapid deployment across research, M&E, GIS, AI, software engineering, and more."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Expert Pool" }]}
      />

      <Section>
        <SectionHeader eyebrow="Disciplines" heading="Where our expert pool contributes" />
        <ul className="mt-8 flex flex-wrap gap-2">
          {DISCIPLINES.map((discipline) => (
            <li key={discipline}>
              <Badge variant="outline" className="normal-case">
                {discipline}
              </Badge>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="muted">
        <SectionHeader eyebrow="Application Workflow" heading="How the Expert Pool works" />
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WORKFLOW_STEPS.map((step) => (
            <Card key={step.title}>
              <span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-full">
                <step.icon className="size-5" aria-hidden="true" />
              </span>
              <p className="text-h4 text-foreground mt-4">{step.title}</p>
              <p className="text-body text-muted-foreground mt-2">{step.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      <CTASection
        heading="Join the Expert Pool"
        description="Register your expert account today to build your advisory profile and access opportunities."
        primaryAction={{ label: "Register Expert Account", href: "/expert-pool/register" }}
        secondaryAction={{ label: "Sign In to Expert Portal", href: "/expert-pool/login" }}
      />
    </>
  );
}
