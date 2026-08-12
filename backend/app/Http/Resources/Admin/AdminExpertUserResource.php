<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Admin-facing Expert Pool user resource. Exposes more workflow fields
 * than the expert-facing resource but STILL excludes all secrets:
 * password, mfa_secret, plaintext recovery codes.
 */
class AdminExpertUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $profile = $this->profile;
        $completion = $profile?->completion();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at?->toIso8601String(),
            'is_active' => $this->is_active,
            'mfa_enabled' => $this->mfa_enabled,
            'created_at' => $this->created_at?->toIso8601String(),

            'profile' => $profile ? [
                'id' => $profile->id,
                'preferred_name' => $profile->preferred_name,
                'phone' => $profile->phone,
                'country' => $profile->country,
                'state' => $profile->state,
                'city' => $profile->city,
                'professional_title' => $profile->professional_title,
                'current_organization' => $profile->current_organization,
                'years_experience' => $profile->years_experience,
                'highest_qualification' => $profile->highest_qualification,
                'field_of_study' => $profile->field_of_study,
                'bio' => $profile->bio,
                'skills' => $profile->skills ?? [],
                'industries' => $profile->industries ?? [],
                'languages' => $profile->languages ?? [],
                'certifications' => $profile->certifications ?? [],
                'disciplines' => $profile->disciplines->map(fn ($d) => [
                    'id' => $d->id,
                    'name' => $d->name,
                    'slug' => $d->slug,
                ]),
                'experiences' => $profile->experiences->map(fn ($e) => [
                    'id' => $e->id,
                    'organization' => $e->organization,
                    'job_title' => $e->job_title,
                    'country' => $e->country,
                    'start_date' => $e->start_date?->format('Y-m-d'),
                    'end_date' => $e->end_date?->format('Y-m-d'),
                    'is_current' => $e->is_current,
                    'description' => $e->description,
                ]),
                'education' => $profile->education->map(fn ($ed) => [
                    'id' => $ed->id,
                    'institution' => $ed->institution,
                    'qualification' => $ed->qualification,
                    'field_of_study' => $ed->field_of_study,
                    'start_year' => $ed->start_year,
                    'end_year' => $ed->end_year,
                    'country' => $ed->country,
                ]),
                'has_cv' => filled($profile->cv_path),
                'cv_original_name' => $profile->cv_original_name,
                'cv_uploaded_at' => $profile->cv_uploaded_at?->toIso8601String(),
                'status' => $profile->status?->value,
                'submitted_at' => $profile->submitted_at?->toIso8601String(),
                'reviewed_at' => $profile->reviewed_at?->toIso8601String(),
                'completion_percentage' => $completion['percentage'] ?? 0,
                'completion_missing' => $completion['missing'] ?? [],
                'updated_at' => $profile->updated_at?->toIso8601String(),
            ] : null,
        ];
    }
}
