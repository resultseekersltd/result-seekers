<?php

namespace App\Http\Resources\ExpertPool;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The professional's own view of an invitation. Deliberately excludes the
 * organisation's identity and internal recruiter notes — the source
 * documents only authorize telling the professional "an opportunity
 * exists" and basic role information at this stage, not which
 * organisation it's for (see talent-expert.txt's consent-disclosure
 * sequencing: the organisation is identified as PART OF the consent
 * request, not before).
 */
class OpportunityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status?->value,
            'sent_at' => $this->sent_at?->toIso8601String(),
            'responded_at' => $this->responded_at?->toIso8601String(),
            'expires_at' => $this->expires_at?->toIso8601String(),
            'assignment_reference' => $this->whenLoaded('entry', fn () => $this->entry?->assignment?->reference),
            'stage' => $this->whenLoaded('entry', fn () => $this->entry?->stage?->value),
        ];
    }
}
