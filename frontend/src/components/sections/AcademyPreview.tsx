import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { CourseCard } from "@/components/cards/CourseCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FadeIn } from "@/components/ui/FadeIn";
import { getCourses } from "@/lib/api/courses";
import { getCourseCategories } from "@/lib/api/course-categories";

/**
 * No courses have been published yet (Academy content is Phase 4/seeder
 * work), so this degrades in two steps: real course cards once they
 * exist, or — today — a teaser built from the real, already-seeded
 * course-category taxonomy instead of an empty section or invented courses.
 */
export async function AcademyPreview() {
  const [{ data: courses }, categories] = await Promise.all([
    getCourses({ perPage: 3 }),
    getCourseCategories(),
  ]);

  return (
    <Section tone="muted" spacing="compact">
      <FadeIn>
        <SectionHeader
          eyebrow="Result Seekers Academy"
          heading="Practical, industry-relevant training"
          description="Hands-on skills across research, data, technology, and institutional development."
        />
      </FadeIn>

      {courses.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      {courses.length === 0 && categories.length > 0 && (
        <div className="mt-6">
          <ul className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Badge variant="outline" className="normal-case">
                  {category.name}
                </Badge>
              </li>
            ))}
          </ul>
          <p className="text-small text-muted-foreground mt-4">
            Course listings are coming soon — explore the training themes above in the meantime.
          </p>
        </div>
      )}

      {courses.length === 0 && categories.length === 0 && (
        <EmptyState
          title="Academy content is temporarily unavailable"
          description="We couldn't reach the Academy catalogue. Please check back shortly."
          className="mt-6"
        />
      )}

      <Button href="/academy" variant="secondary" className="mt-8">
        Visit the Academy
      </Button>
    </Section>
  );
}
