<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ArticleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * `status` is deliberately NOT exposed — public endpoints only ever
     * query published articles (see ArticleController), so the field
     * would be redundant and it's an internal workflow detail.
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
            'content' => $this->content,
            'authorName' => $this->author_name,
            'authorTitle' => $this->author_title,
            'coverImagePath' => $this->cover_image_path,
            'readingTimeMinutes' => $this->reading_time_minutes,
            'isFeatured' => $this->is_featured,
            'publishedAt' => $this->published_at?->toIso8601String(),
            'category' => new ArticleCategoryResource($this->whenLoaded('category')),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'solutions' => SolutionResource::collection($this->whenLoaded('solutions')),
        ];
    }
}
