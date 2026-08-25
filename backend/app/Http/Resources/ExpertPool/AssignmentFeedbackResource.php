<?php

namespace App\Http\Resources\ExpertPool;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** Never exposes the submitter's identity — only whether a row is the viewer's own submission. */
class AssignmentFeedbackResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $actor = $request->user();

        return [
            'id' => $this->id,
            'is_mine' => $this->submitter_type === $actor::class && (int) $this->submitter_id === (int) $actor->id,
            'rating' => $this->rating,
            'comments' => $this->comments,
            'submitted_at' => $this->submitted_at?->toIso8601String(),
        ];
    }
}
