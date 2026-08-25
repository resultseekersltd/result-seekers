<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Serialises a User (admin) account for return to the authenticated admin.
 * NEVER exposes: password, mfa_secret, remember_token.
 */
class AdminUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'is_active' => $this->is_active,
            'mfa_enabled' => $this->mfa_enabled,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
