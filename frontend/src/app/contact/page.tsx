import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Result Seekers about a project, proposal, partnership, product, or training enquiry.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact | Result Seekers",
    description: "Get in touch with Result Seekers about a project, proposal, partnership, product, or training enquiry.",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact"
        description="Get in touch to discuss your research, technology, or capacity development needs."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <Section>
        <ContactForm />
      </Section>
    </>
  );
}
