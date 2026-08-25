<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * RS-internal only — this resource is never returned by any
 * Organisation- or ExpertPool-facing controller. talent-expert.txt: "Do
 * not allow organisations to see referee personal information unless
 * specifically authorised."
 */
class ReferenceCheckResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'candidate_pipeline_entry_id' => $this->candidate_pipeline_entry_id,
            'referee_name' => $this->referee_name,
            'referee_relationship' => $this->referee_relationship,
            'referee_organisation' => $this->referee_organisation,
            'contact_method' => $this->contact_method,
            'referee_contact' => $this->referee_contact,
            'candidate_consented_at' => $this->candidate_consented_at?->toIso8601String(),
            'consent_text_version' => $this->consent_text_version,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'requested_by' => $this->whenLoaded('requestedBy', fn () => $this->requestedBy?->name),
            'date_contacted' => $this->date_contacted?->toIso8601String(),
            'response_status' => $this->response_status,
            'verification_notes' => $this->verification_notes,
            'risk_flags' => $this->risk_flags,
            'final_outcome' => $this->final_outcome?->value,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
