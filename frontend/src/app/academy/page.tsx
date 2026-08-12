import type { Metadata } from "next";
import Image from "next/image";
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
import { FadeIn } from "@/components/ui/FadeIn";

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

const TRAINING_TRACKS = [
  {
    name: "Corporate Training",
    description: "Customized institutional capacity building tailored to organizational strategy and team workflows.",
  },
  {
    name: "Professional Training",
    description: "Industry-accredited masterclasses in data analytics, project evaluation, and software engineering.",
  },
  {
    name: "Youth Development",
    description: "Empowering emerging talent with practical digital technology and research skills.",
  },
] as const;

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
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <FadeIn>
            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/30 p-2 shadow-xl">
              <div className="relative aspect-4/3 overflow-hidden rounded-xl">
                <Image
                  src="/images/academy-hero.png"
                  alt="Result Seekers Academy Corporate Executive Workshop"
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="flex flex-col gap-4">
              <p className="text-small font-semibold tracking-wide text-accent uppercase">
                World-Class Capacity Building
              </p>
              <h2 className="text-display text-foreground">
                Empowering Teams Through Executive Learning
              </h2>
              <p className="text-body-lg text-muted-foreground">
                We combine practical field evidence, modern digital tools, and experienced instructors to deliver transformational corporate workshops and certified professional development.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge key={category.id} variant="outline" className="px-3 py-1.5 text-xs normal-case">
                    {category.name}
                  </Badge>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeader eyebrow="How We Deliver Training" heading="Training Tracks" />
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {TRAINING_TRACKS.map((track) => (
            <Card key={track.name} className="flex flex-col gap-3 p-6 transition-all hover:border-primary/50 hover:shadow-md">
              <p className="text-h4 text-foreground">{track.name}</p>
              <p className="text-small text-muted-foreground">{track.description}</p>
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
