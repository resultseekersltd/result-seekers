<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminOrganisationUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role?->value,
            'organisation_id' => $this->organisation_id,
            'organisation_name' => $this->whenLoaded('organisation', fn () => $this->organisation->name),
            'email_verified_at' => $this->email_verified_at?->toIso8601String(),
            'is_active' => $this->is_active,
            'mfa_enabled' => $this->mfa_enabled,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
