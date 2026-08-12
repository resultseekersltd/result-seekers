<?php

namespace App\Http\Resources\ExpertPool;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpertEducationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'institution' => $this->institution,
            'qualification' => $this->qualification,
            'field_of_study' => $this->field_of_study,
            'start_year' => $this->start_year,
            'end_year' => $this->end_year,
            'country' => $this->country,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
