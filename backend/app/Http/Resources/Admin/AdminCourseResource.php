<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\CourseCategoryResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** Admin-only counterpart to CourseResource — adds `status` and the raw category FK the edit form needs. */
class AdminCourseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'courseCategoryId' => $this->course_category_id,
            'slug' => $this->slug,
            'title' => $this->title,
            'summary' => $this->summary,
            'description' => $this->description,
            'track' => $this->track?->value,
            'deliveryMode' => $this->delivery_mode?->value,
            'durationText' => $this->duration_text,
            'status' => $this->status->value,
            'isFeatured' => $this->is_featured,
            'order' => $this->order,
            'category' => new CourseCategoryResource($this->whenLoaded('category')),
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
