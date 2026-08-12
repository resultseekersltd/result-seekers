import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TextLink } from "@/components/ui/TextLink";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/course";

interface CourseCardProps {
  course: Pick<Course, "slug" | "title" | "summary" | "durationText" | "category">;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card hoverable className="flex flex-col">
      {course.category && <Badge variant="accent">{course.category.name}</Badge>}
      <p className={cn("text-h4 text-foreground", course.category && "mt-3")}>{course.title}</p>
      <p className="text-body text-muted-foreground mt-2 flex-1">{course.summary}</p>
      {course.durationText && (
        <p className="text-small text-muted-foreground mt-3">{course.durationText}</p>
      )}
      <TextLink href={`/academy/${course.slug}`} withArrow className="mt-4">
        Learn More
      </TextLink>
    </Card>
  );
}
