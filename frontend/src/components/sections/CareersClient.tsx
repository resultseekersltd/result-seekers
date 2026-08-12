"use client";

import { useState } from "react";
import { Briefcase, GraduationCap, Sparkles, Send } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { JobApplicationModal } from "@/components/forms/JobApplicationModal";

interface VacancyItem {
  id: number;
  type: "vacancy" | "graduate_programme" | "internship";
  title: string;
  department?: string;
  location?: string;
  summary: string;
}

interface CareersClientProps {
  vacancies?: VacancyItem[];
}

const VACANCY_CATEGORIES = [
  {
    type: "vacancy",
    icon: Briefcase,
    title: "Current Vacancies",
    description: "Open roles across Result Seekers' research, technology, and delivery teams.",
  },
  {
    type: "graduate_programme",
    icon: GraduationCap,
    title: "Graduate Programme",
    description: "A structured entry point for early-career professionals.",
  },
  {
    type: "internship",
    icon: Sparkles,
    title: "Internship Programme",
    description: "Short-term, hands-on placements for students and early-career candidates.",
  },
] as const;

export function CareersClient({ vacancies = [] }: CareersClientProps) {
  const [selectedVacancy, setSelectedVacancy] = useState<{ id?: number; title?: string } | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApply = (id?: number, title?: string) => {
    setSelectedVacancy(id ? { id, title } : null);
    setIsModalOpen(true);
  };

  return (
    <>
      <Section>
        <SectionHeader eyebrow="Opportunities" heading="Ways to join Result Seekers" />
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {VACANCY_CATEGORIES.map((category) => {
            const categoryVacancies = vacancies.filter((v) => v.type === category.type);

            return (
              <Card key={category.title} className="flex flex-col justify-between">
                <div>
                  <span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-full">
                    <category.icon className="size-5" aria-hidden="true" />
                  </span>
                  <p className="text-h4 text-foreground mt-4">{category.title}</p>
                  <p className="text-body text-muted-foreground mt-2">{category.description}</p>

                  {categoryVacancies.length > 0 ? (
                    <div className="mt-4 flex flex-col gap-3">
                      {categoryVacancies.map((v) => (
                        <div key={v.id} className="border-border rounded-lg border p-3">
                          <p className="font-semibold text-foreground">{v.title}</p>
                          {v.location && (
                            <p className="text-xs text-muted-foreground mt-0.5">{v.location}</p>
                          )}
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleApply(v.id, v.title)}
                            className="mt-2 w-full"
                          >
                            Apply Now
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-small text-muted-foreground mt-4">
                      No open positions listed at this time.
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleApply(undefined, `${category.title} Speculative Application`)}
                    className="w-full"
                  >
                    Express Interest
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section tone="muted">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-small text-accent font-semibold tracking-wide uppercase">
            Not Seeing the Right Role?
          </p>
          <h2 className="text-display text-foreground mt-3">Future Opportunities</h2>
          <p className="text-body-lg text-muted-foreground mt-4">
            Send us your CV and cover letter for future opportunities, even without a specific vacancy in mind.
          </p>
          <div className="mt-6 flex justify-center">
            <Button size="lg" onClick={() => handleApply(undefined, "Future Opportunities")}>
              <Send className="mr-2 size-4" />
              Submit Speculative Application
            </Button>
          </div>
          <p className="text-body text-muted-foreground mt-6">
            Looking to contribute at a strategic level instead of through employment?{" "}
            <TextLink href="/leadership-partners">Explore Strategic Leadership Partners</TextLink>.
          </p>
        </div>
      </Section>

      <JobApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vacancyId={selectedVacancy?.id}
        vacancyTitle={selectedVacancy?.title}
      />
    </>
  );
}
