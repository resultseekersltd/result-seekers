<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * `status` is deliberately NOT exposed — public endpoints only ever
     * query published courses (see CourseController).
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'summary' => $this->summary,
            'description' => $this->description,
            'track' => $this->track?->value,
            'deliveryMode' => $this->delivery_mode?->value,
            'durationText' => $this->duration_text,
            'isFeatured' => $this->is_featured,
            'order' => $this->order,
            'category' => new CourseCategoryResource($this->whenLoaded('category')),
        ];
    }
}
