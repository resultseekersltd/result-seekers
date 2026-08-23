<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlacementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'candidate_pipeline_entry_id' => $this->candidate_pipeline_entry_id,
            'engagement_type' => $this->engagement_type,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'deployment_location' => $this->deployment_location,
            'deployment_notes' => $this->deployment_notes,
            'onboarding_notes' => $this->onboarding_notes,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'organisation_confirmed_at' => $this->organisation_confirmed_at?->toIso8601String(),
            'organisation_confirmed_by' => $this->whenLoaded('organisationConfirmedBy', fn () => $this->organisationConfirmedBy?->name),
            'professional_confirmed_at' => $this->professional_confirmed_at?->toIso8601String(),
            'professional_confirmed_by' => $this->whenLoaded('professionalConfirmedBy', fn () => $this->professionalConfirmedBy?->name),
            'created_by' => $this->whenLoaded('creator', fn () => $this->creator?->name),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
