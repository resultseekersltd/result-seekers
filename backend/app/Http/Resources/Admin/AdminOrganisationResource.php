<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminOrganisationResource extends JsonResource
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
            'official_email_domain' => $this->official_email_domain,
            'contact_person_name' => $this->contact_person_name,
            'contact_person_position' => $this->contact_person_position,
            'contact_person_phone' => $this->contact_person_phone,
            'registration_number' => $this->registration_number,
            'tax_regulatory_info' => $this->tax_regulatory_info,
            'profile_description' => $this->profile_description,
            'recruitment_needs' => $this->recruitment_needs,
            'terms_agreed' => $this->terms_agreed,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'verified_at' => $this->verified_at?->toIso8601String(),
            'verified_by' => $this->verified_by,
            'users_count' => $this->whenCounted('users'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
