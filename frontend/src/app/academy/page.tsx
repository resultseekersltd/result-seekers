import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { CTASection } from "@/components/layout/CTASection";
import { CourseCard } from "@/components/cards/CourseCard";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { getCourses } from "@/lib/api/courses";
import { getCourseCategories } from "@/lib/api/course-categories";

export const metadata: Metadata = {
  title: "Academy",
  description:
    "The Result Seekers Academy provides practical, industry-relevant learning — corporate training, professional development, and youth programmes.",
  alternates: {
    canonical: "/academy",
  },
  openGraph: {
    title: "Academy | Result Seekers",
    description:
      "The Result Seekers Academy provides practical, industry-relevant learning — corporate training, professional development, and youth programmes.",
    url: "/academy",
  },
};

/**
 * Names only, verbatim from 03_Feature_Specification.md §8 — no
 * description text is given for any of these three in the spec, so none
 * is invented here.
 */
const TRAINING_TRACKS = ["Corporate Training", "Professional Training", "Youth Development"] as const;

/**
 * Content gaps (see Task 005 report): the spec names "Certification",
 * "Training Calendar", and "Instructor Network" as Academy sections
 * (03_Feature_Specification.md §8) — Certification and Instructor
 * Network have no approved content anywhere in the docs, and Training
 * Calendar is explicitly marked "(Placeholder)" in the spec itself, so
 * none are built out beyond a short "coming soon" note.
 */
export default async function AcademyPage() {
  const [{ data: courses, error: coursesError }, categories] = await Promise.all([
    getCourses({ perPage: 9 }),
    getCourseCategories(),
  ]);

  return (
    <>
      <PageHeader
        title="Result Seekers Academy"
        description="The Result Seekers Academy provides practical, industry-relevant learning opportunities."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Academy" }]}
      />

      <Section>
        <SectionHeader eyebrow="Training Categories" heading="What you can learn with us" />
        <ul className="mt-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <li key={category.id}>
              <Badge variant="outline" className="normal-case">
                {category.name}
              </Badge>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="muted">
        <SectionHeader eyebrow="How We Deliver Training" heading="Training Tracks" />
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {TRAINING_TRACKS.map((track) => (
            <Card key={track} className="text-center">
              <p className="text-h4 text-foreground">{track}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader eyebrow="Courses" heading="Upcoming Courses" />
        {courses.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : coursesError ? (
          <ErrorState
            description="We couldn't load the course catalogue. Please try again shortly."
            className="mt-8"
          />
        ) : (
          <EmptyState
            title="Course listings are coming soon"
            description="Individual course dates and enrolment details will appear here as they're published. In the meantime, get in touch to discuss corporate or group training."
            action={{ label: "Request Training", href: "/contact" }}
            className="mt-8"
          />
        )}
      </Section>

      <CTASection
        heading="Let's Work Together"
        description="Get in touch to discuss your research, technology, or capacity development needs."
        primaryAction={{ label: "Start a Project", href: "/contact" }}
        secondaryAction={{ label: "Explore Solutions", href: "/solutions" }}
      />
    </>
  );
}
