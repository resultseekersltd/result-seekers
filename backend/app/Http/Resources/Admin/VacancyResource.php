<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VacancyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type->value,
            'title' => $this->title,
            'slug' => $this->slug,
            'department' => $this->department,
            'location' => $this->location,
            'summary' => $this->summary,
            'description' => $this->description,
            'requirements' => $this->requirements,
            'applicationDeadline' => $this->application_deadline?->toDateString(),
            'status' => $this->status->value,
            'isFeatured' => $this->is_featured,
            'order' => $this->order,
        ];
    }
}
