<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** RS-internal view — includes recruiter notes, screening, quality review. Never returned to any organisation-side endpoint. */
class CandidatePipelineEntryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'recruitment_assignment_id' => $this->recruitment_assignment_id,
            'expert_pool_profile_id' => $this->expert_pool_profile_id,
            'professional_title' => $this->whenLoaded('profile', fn () => $this->profile?->professional_title),
            'stage' => $this->stage?->value,
            'stage_label' => $this->stage?->label(),
            'outcome' => $this->outcome?->value,
            'outcome_reason' => $this->outcome_reason,
            'recruiter_notes' => $this->recruiter_notes,
            'screening_decision' => $this->screening_decision?->value,
            'screening_notes' => $this->screening_notes,
            'screened_at' => $this->screened_at?->toIso8601String(),
            'quality_review_decision' => $this->quality_review_decision?->value,
            'quality_review_notes' => $this->quality_review_notes,
            'quality_reviewed_at' => $this->quality_reviewed_at?->toIso8601String(),
            'invitation' => $this->whenLoaded('invitation', fn () => $this->invitation ? [
                'status' => $this->invitation->status?->value,
                'sent_at' => $this->invitation->sent_at?->toIso8601String(),
                'responded_at' => $this->invitation->responded_at?->toIso8601String(),
            ] : null),
            'latest_consent' => $this->whenLoaded('consents', function () {
                $consent = $this->consents->sortByDesc('created_at')->first();

                return $consent ? [
                    'id' => $consent->id,
                    'status' => $consent->status?->value,
                ] : null;
            }),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
