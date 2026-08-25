<?php

namespace App\Http\Resources\Organisation;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Renders directly from DataRelease::released_fields — the frozen
 * allowlist snapshot taken at release time — never a live join back to
 * ExpertPoolProfile. This is deliberate: it guarantees the organisation
 * can never see a field added to the profile after release that wasn't
 * part of the original consented disclosure.
 */
class ReleasedCandidateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'candidate' => $this->released_fields,
            'purpose' => $this->purpose,
            'released_at' => $this->released_at?->toIso8601String(),
            'organisation_status' => $this->organisation_status,
            'comments_count' => $this->whenCounted('comments'),
        ];
    }
}
