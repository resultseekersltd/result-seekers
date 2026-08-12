<?php

namespace App\Http\Resources\ExpertPool;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Serialises an ExpertUser for return to the authenticated expert.
 * NEVER exposes: password, mfa_secret, remember_token.
 */
class ExpertUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at?->toIso8601String(),
            'is_active' => $this->is_active,
            'mfa_enabled' => $this->mfa_enabled,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
