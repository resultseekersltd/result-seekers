<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SolutionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * Keys are camelCase to match the frontend's src/types/solution.ts —
     * DB columns stay snake_case, this is the only translation layer.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'summary' => $this->summary,
            'icon' => $this->icon,
            'heroHeading' => $this->hero_heading,
            'heroDescription' => $this->hero_description,
            'problemStatement' => $this->problem_statement,
            'ourApproach' => $this->our_approach,
            'services' => $this->services,
            'outputs' => $this->outputs,
            'tools' => $this->tools,
            'order' => $this->order,
            'products' => ProductResource::collection($this->whenLoaded('products')),
            'articles' => ArticleResource::collection($this->whenLoaded('articles')),
        ];
    }
}
