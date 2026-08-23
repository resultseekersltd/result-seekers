<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InterviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'candidate_pipeline_entry_id' => $this->candidate_pipeline_entry_id,
            'type' => $this->type,
            'scheduled_at' => $this->scheduled_at?->toIso8601String(),
            'timezone' => $this->timezone,
            'location_or_link' => $this->location_or_link,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'candidate_confirmed_at' => $this->candidate_confirmed_at?->toIso8601String(),
            'created_by' => $this->whenLoaded('creator', fn () => $this->creator?->name),
            'panel_members' => $this->whenLoaded('panelMembers', fn () => $this->panelMembers->map(fn ($member) => [
                'id' => $member->id,
                'panelist_type' => class_basename($member->panelist_type),
                'panelist_name' => $member->panelist?->name,
                'role' => $member->role,
            ])),
            'scorecards' => $this->whenLoaded('scorecards', fn () => $this->scorecards->map(fn ($scorecard) => [
                'id' => $scorecard->id,
                'panelist_type' => class_basename($scorecard->panelist_type),
                'panelist_name' => $scorecard->panelist?->name,
                'competency_scores' => $scorecard->competency_scores,
                'panel_comments' => $scorecard->panel_comments,
                'overall_recommendation' => $scorecard->overall_recommendation?->value,
                'conflict_of_interest' => $scorecard->conflict_of_interest,
                'submitted_at' => $scorecard->submitted_at?->toIso8601String(),
            ])),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
