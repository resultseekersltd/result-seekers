<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminTalentRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'organisation_id' => $this->organisation_id,
            'organisation_name' => $this->whenLoaded('organisation', fn () => $this->organisation->name),
            'requested_by' => $this->whenLoaded('requester', fn () => $this->requester?->name),
            'assigned_recruiter_id' => $this->assigned_recruiter_id,
            'assigned_recruiter_name' => $this->whenLoaded('assignedRecruiter', fn () => $this->assignedRecruiter?->name),
            'service_type' => $this->service_type,
            'title' => $this->title,
            'number_required' => $this->number_required,
            'location' => $this->location,
            'arrangement' => $this->arrangement,
            'engagement_type' => $this->engagement_type,
            'duration' => $this->duration,
            'start_date' => $this->start_date?->toDateString(),
            'deadline' => $this->deadline?->toDateString(),
            'description' => $this->description,
            'essential_qualifications' => $this->essential_qualifications,
            'desirable_qualifications' => $this->desirable_qualifications,
            'years_experience_required' => $this->years_experience_required,
            'required_skills' => $this->required_skills,
            'budget_range' => $this->budget_range,
            'confidentiality_level' => $this->confidentiality_level,
            'details' => $this->details,
            'status' => $this->status?->value,
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
