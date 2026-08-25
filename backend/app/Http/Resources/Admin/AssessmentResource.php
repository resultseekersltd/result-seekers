<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** RS-internal view — full detail including submissions and scores. */
class AssessmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'candidate_pipeline_entry_id' => $this->candidate_pipeline_entry_id,
            'type' => $this->type,
            'title' => $this->title,
            'instructions' => $this->instructions,
            'time_limit_minutes' => $this->time_limit_minutes,
            'starts_at' => $this->starts_at?->toIso8601String(),
            'closes_at' => $this->closes_at?->toIso8601String(),
            'attempt_limit' => $this->attempt_limit,
            'scoring_rules' => $this->scoring_rules,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'result_visible_to_candidate' => $this->result_visible_to_candidate,
            'assigned_by' => $this->whenLoaded('assignedBy', fn () => $this->assignedBy?->name),
            'reviewer' => $this->whenLoaded('reviewer', fn () => $this->reviewer?->name),
            'submissions' => $this->whenLoaded('submissions', fn () => $this->submissions->map(fn ($submission) => [
                'id' => $submission->id,
                'attempt_number' => $submission->attempt_number,
                'response_text' => $submission->response_text,
                'has_file' => (bool) $submission->file_path,
                'file_original_name' => $submission->file_original_name,
                'answers' => $submission->answers,
                'submitted_at' => $submission->submitted_at?->toIso8601String(),
                'score' => $submission->score ? [
                    'id' => $submission->score->id,
                    'score' => $submission->score->score,
                    'max_score' => $submission->score->max_score,
                    'criteria_breakdown' => $submission->score->criteria_breakdown,
                    'review_notes' => $submission->score->review_notes,
                    'reviewer' => $submission->score->reviewer?->name,
                    'reviewed_at' => $submission->score->reviewed_at?->toIso8601String(),
                ] : null,
            ])),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
