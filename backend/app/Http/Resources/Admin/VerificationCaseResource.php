<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VerificationCaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'expert_pool_profile_id' => $this->expert_pool_profile_id,
            'candidate_pipeline_entry_id' => $this->candidate_pipeline_entry_id,
            'expert_name' => $this->whenLoaded('profile', fn () => $this->profile->expertUser?->name),
            'target_level' => $this->target_level?->value,
            'status' => $this->status?->value,
            'opened_at' => $this->opened_at?->toIso8601String(),
            'closed_at' => $this->closed_at?->toIso8601String(),
            'checks' => VerificationCheckResource::collection($this->whenLoaded('checks')),
        ];
    }
}
