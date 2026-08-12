<?php

namespace App\Http\Resources\ExpertPool;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Full profile resource returned to the authenticated expert.
 * cv_path is intentionally replaced with a boolean 'has_cv' — the actual
 * file path is never exposed to the frontend; downloads go through the
 * CvController which enforces ownership checks.
 */
class ExpertPoolProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $completion = $this->completion();

        return [
            'id' => $this->id,
            'expert_user_id' => $this->expert_user_id,

            // Personal
            'preferred_name' => $this->preferred_name,
            'phone' => $this->phone,
            'country' => $this->country,
            'state' => $this->state,
            'city' => $this->city,

            // Professional
            'professional_title' => $this->professional_title,
            'current_organization' => $this->current_organization,
            'years_experience' => $this->years_experience,
            'highest_qualification' => $this->highest_qualification,
            'field_of_study' => $this->field_of_study,
            'bio' => $this->bio,
            'skills' => $this->skills ?? [],
            'industries' => $this->industries ?? [],
            'languages' => $this->languages ?? [],
            'certifications' => $this->certifications ?? [],

            // Disciplines (taxonomy items)
            'disciplines' => $this->whenLoaded('disciplines', fn () => $this->disciplines->map(fn ($d) => ['id' => $d->id, 'name' => $d->name, 'slug' => $d->slug])
            ),

            // CV — never expose the storage path
            'has_cv' => filled($this->cv_path),
            'cv_original_name' => $this->cv_original_name,
            'cv_uploaded_at' => $this->cv_uploaded_at?->toIso8601String(),

            // Workflow
            'status' => $this->status?->value,
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),

            // Completion
            'completion_percentage' => $completion['percentage'],
            'completion_missing' => $completion['missing'],

            // Relations
            'experiences' => ExpertExperienceResource::collection($this->whenLoaded('experiences')),
            'education' => ExpertEducationResource::collection($this->whenLoaded('education')),

            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
