/** Mirrors the `course-categories` API resource (backend: app/Models/CourseCategory.php). */
export interface CourseCategory {
  id: number;
  slug: string;
  name: string;
  order: number;
}
