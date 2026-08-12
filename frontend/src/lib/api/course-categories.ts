import { apiFetch, type ApiCollectionResponse } from "@/lib/api/client";
import type { CourseCategory } from "@/types/course-category";

/** Falls back to an empty array on failure — see getSolutions() for why. */
export async function getCourseCategories(): Promise<CourseCategory[]> {
  try {
    const { data } = await apiFetch<ApiCollectionResponse<CourseCategory>>("/course-categories");
    return data;
  } catch (error) {
    console.error("Failed to fetch course categories:", error);
    return [];
  }
}
