<?php

namespace App\Http\Resources\ExpertPool;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** The professional's own view — never exposes internal RS actor identity. */
class PlacementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'engagement_type' => $this->engagement_type,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'deployment_location' => $this->deployment_location,
            'deployment_notes' => $this->deployment_notes,
            'onboarding_notes' => $this->onboarding_notes,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'organisation_confirmed_at' => $this->organisation_confirmed_at?->toIso8601String(),
            'professional_confirmed_at' => $this->professional_confirmed_at?->toIso8601String(),
        ];
    }
}
