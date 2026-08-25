<?php

namespace App\Http\Resources\Organisation;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** The organisation's own view of itself — full profile, own status visible. */
class OrganisationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'legal_name' => $this->legal_name,
            'trading_name' => $this->trading_name,
            'organisation_type' => $this->organisation_type,
            'sector' => $this->sector,
            'country' => $this->country,
            'state' => $this->state,
            'registered_address' => $this->registered_address,
            'website' => $this->website,
            'registration_number' => $this->registration_number,
            'profile_description' => $this->profile_description,
            'recruitment_needs' => $this->recruitment_needs,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'verified_at' => $this->verified_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
