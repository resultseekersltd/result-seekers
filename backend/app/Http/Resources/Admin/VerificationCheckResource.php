<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VerificationCheckResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'check_type' => $this->check_type,
            'subject' => $this->subject,
            'status' => $this->status?->value,
            'verifier' => $this->whenLoaded('verifier', fn () => $this->verifier?->name),
            'started_at' => $this->started_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'evidence_reviewed' => $this->evidence_reviewed,
            'method_used' => $this->method_used,
            'internal_notes' => $this->internal_notes,
            'expires_at' => $this->expires_at?->toIso8601String(),
            'rejection_reason' => $this->rejection_reason,
        ];
    }
}
