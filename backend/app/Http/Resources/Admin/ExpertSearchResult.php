<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The RS-recruiter-facing search result shape — an explicit ALLOWLIST,
 * never the full ExpertPoolProfile. Fields match talent-expert.txt's
 * "the organisation should initially receive an anonymised candidate
 * profile containing only appropriate information such as..." list
 * exactly (this resource is used for the Recruiter's own internal search
 * in Phase 1 — organisations never call this endpoint at all, see the
 * readiness report's discovery-model correction). Never include: email,
 * phone, address, ID documents, certificates, referee contacts, private
 * recruiter notes, verification evidence, rate/salary expectations, full
 * CV path, or confidential current-employer details.
 */
class ExpertSearchResult extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'professional_title' => $this->professional_title,
            'years_experience' => $this->years_experience,
            'country' => $this->country,
            'state' => $this->state,
            'disciplines' => $this->whenLoaded('disciplines', fn () => $this->disciplines->pluck('name')),
            'languages' => $this->languages,
            'verification_level' => $this->verification_level?->value,
            'verification_level_label' => $this->verification_level?->label(),
            'visibility_status' => $this->visibility_status?->value,
            'expert_pool_status' => $this->status?->value,
        ];
    }
}
