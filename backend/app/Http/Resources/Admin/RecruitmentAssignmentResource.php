<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecruitmentAssignmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'talent_request_id' => $this->talent_request_id,
            'talent_request_title' => $this->whenLoaded('talentRequest', fn () => $this->talentRequest?->title),
            'organisation_id' => $this->organisation_id,
            'organisation_name' => $this->whenLoaded('organisation', fn () => $this->organisation?->name),
            'recruiter_id' => $this->recruiter_id,
            'recruiter_name' => $this->whenLoaded('recruiter', fn () => $this->recruiter?->name),
            'status' => $this->status?->value,
            'opened_at' => $this->opened_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'cancelled_at' => $this->cancelled_at?->toIso8601String(),
            'archived_at' => $this->archived_at?->toIso8601String(),
            'pipeline_count' => $this->whenCounted('pipelineEntries'),
        ];
    }
}
