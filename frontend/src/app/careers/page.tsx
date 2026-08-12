import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { CTASection } from "@/components/layout/CTASection";
import { CareersClient } from "@/components/sections/CareersClient";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Current vacancies, the Graduate Programme, and the Internship Programme at Result Seekers.",
  alternates: {
    canonical: "/careers",
  },
  openGraph: {
    title: "Careers | Result Seekers",
    description:
      "Current vacancies, the Graduate Programme, and the Internship Programme at Result Seekers.",
    url: "/careers",
  },
};

export default function CareersPage() {
  return (
    <>
      <PageHeader
        title="Careers"
        description="Opportunities to work with Result Seekers across current vacancies, our Graduate Programme, and our Internship Programme."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Careers" }]}
      />

      <CareersClient />

      <CTASection
        heading="Get in Touch"
        description="Reach out about current vacancies, the Graduate Programme, the Internship Programme, or future opportunities."
        primaryAction={{ label: "Contact Us", href: "/contact" }}
        secondaryAction={{ label: "Explore Academy", href: "/academy" }}
      />
    </>
  );
}
