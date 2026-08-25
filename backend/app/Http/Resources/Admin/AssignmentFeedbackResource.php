<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** RS-internal view — manager-tier oversight sees both parties' feedback regardless of mutual-visibility state. */
class AssignmentFeedbackResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'placement_id' => $this->placement_id,
            'submitter_type' => class_basename($this->submitter_type),
            'submitter_name' => $this->submitter?->name,
            'rating' => $this->rating,
            'comments' => $this->comments,
            'submitted_at' => $this->submitted_at?->toIso8601String(),
        ];
    }
}
