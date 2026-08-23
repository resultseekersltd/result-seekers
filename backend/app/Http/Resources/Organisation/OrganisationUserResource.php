<?php

namespace App\Http\Resources\Organisation;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** NEVER exposes: password, mfa_secret, remember_token. */
class OrganisationUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role?->value,
            'email_verified_at' => $this->email_verified_at?->toIso8601String(),
            'is_active' => $this->is_active,
            'mfa_enabled' => $this->mfa_enabled,
            'organisation_id' => $this->organisation_id,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
