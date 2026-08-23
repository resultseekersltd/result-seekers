<?php

namespace App\Http\Resources\ExpertPool;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** The candidate's own view — never exposes panel identity, scorecards, or interviewer notes. */
class InterviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'scheduled_at' => $this->scheduled_at?->toIso8601String(),
            'timezone' => $this->timezone,
            'location_or_link' => $this->location_or_link,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'candidate_confirmed_at' => $this->candidate_confirmed_at?->toIso8601String(),
        ];
    }
}
