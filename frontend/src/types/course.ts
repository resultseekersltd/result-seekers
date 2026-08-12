import type { CourseCategory } from "@/types/course-category";

export type CourseTrack = "corporate" | "professional" | "youth";
export type CourseDeliveryMode = "in_person" | "online" | "hybrid";

/**
 * Mirrors the `courses` API resource (backend: app/Models/Course.php,
 * app/Enums/CourseTrack.php, app/Enums/CourseDeliveryMode.php). `status` is
 * intentionally not included — the public API only ever returns published courses.
 */
export interface Course {
  id: number;
  slug: string;
  title: string;
  summary: string;
  description: string | null;
  track: CourseTrack | null;
  deliveryMode: CourseDeliveryMode | null;
  durationText: string | null;
  isFeatured: boolean;
  order: number;
  category?: CourseCategory;
}
