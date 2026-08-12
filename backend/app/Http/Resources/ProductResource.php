<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * Keys are camelCase to match the frontend's src/types/product.ts.
     * `status` is cast to the ProductStatus enum on the model, so
     * `->value` gives back the plain string the frontend's
     * ProductStatus union expects (e.g. "under_development").
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'category' => $this->category,
            'shortDescription' => $this->short_description,
            'description' => $this->description,
            'status' => $this->status->value,
            'externalUrl' => $this->external_url,
            'targetUsers' => $this->target_users,
            'features' => $this->features,
            'logoPath' => $this->logo_path,
            'order' => $this->order,
            'solutions' => SolutionResource::collection($this->whenLoaded('solutions')),
        ];
    }
}
