<?php

namespace App\Http\Resources\ExpertPool;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConsentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'purpose' => $this->purpose,
            'consent_text_version' => $this->consent_text_version,
            'status' => $this->status?->value,
            'requested_at' => $this->requested_at?->toIso8601String(),
            'responded_at' => $this->responded_at?->toIso8601String(),
            'consented_at' => $this->consented_at?->toIso8601String(),
            'declined_at' => $this->declined_at?->toIso8601String(),
            'withdrawn_at' => $this->withdrawn_at?->toIso8601String(),
        ];
    }
}
