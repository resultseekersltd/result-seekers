<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\ArticleCategoryResource;
use App\Http\Resources\SolutionResource;
use App\Http\Resources\TagResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Admin-only counterpart to ArticleResource — adds `status` and raw FK/
 * relation IDs the edit form needs, neither of which the public resource
 * exposes on purpose.
 */
class AdminArticleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'articleCategoryId' => $this->article_category_id,
            'slug' => $this->slug,
            'title' => $this->title,
            'summary' => $this->summary,
            'content' => $this->content,
            'authorName' => $this->author_name,
            'authorTitle' => $this->author_title,
            'coverImagePath' => $this->cover_image_path,
            'readingTimeMinutes' => $this->reading_time_minutes,
            'status' => $this->status->value,
            'isFeatured' => $this->is_featured,
            'publishedAt' => $this->published_at?->toIso8601String(),
            'category' => new ArticleCategoryResource($this->whenLoaded('category')),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'tagIds' => $this->whenLoaded('tags', fn () => $this->tags->pluck('id')),
            'solutions' => SolutionResource::collection($this->whenLoaded('solutions')),
            'solutionIds' => $this->whenLoaded('solutions', fn () => $this->solutions->pluck('id')),
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
