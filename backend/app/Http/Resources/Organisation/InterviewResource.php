<?php

namespace App\Http\Resources\Organisation;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The organisation's own view of an interview for one of their released
 * candidates. `my_scorecard` is only populated when the viewing
 * organisation user is themself a panel member — never anyone else's.
 */
class InterviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $actor = $request->user();
        $myScorecard = $this->scorecards
            ?->where('panelist_type', $actor::class)
            ->where('panelist_id', $actor->id)
            ->first();

        return [
            'id' => $this->id,
            'type' => $this->type,
            'scheduled_at' => $this->scheduled_at?->toIso8601String(),
            'timezone' => $this->timezone,
            'location_or_link' => $this->location_or_link,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'is_panel_member' => (bool) $myScorecard || $this->panelMembers?->where('panelist_type', $actor::class)->where('panelist_id', $actor->id)->isNotEmpty(),
            'my_scorecard' => $myScorecard ? [
                'id' => $myScorecard->id,
                'competency_scores' => $myScorecard->competency_scores,
                'panel_comments' => $myScorecard->panel_comments,
                'overall_recommendation' => $myScorecard->overall_recommendation?->value,
                'submitted_at' => $myScorecard->submitted_at?->toIso8601String(),
            ] : null,
        ];
    }
}
