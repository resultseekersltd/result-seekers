<?php

namespace App\Http\Resources\ExpertPool;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The professional's own view — never exposes reviewer identity or
 * criteria_breakdown/review_notes, and only exposes the score itself once
 * `result_visible_to_candidate` is true (talent-expert.txt: "Result
 * visibility" is an explicit per-assessment configurable field).
 */
class AssessmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $latestSubmission = $this->submissions?->sortByDesc('attempt_number')->first();

        return [
            'id' => $this->id,
            'type' => $this->type,
            'title' => $this->title,
            'instructions' => $this->instructions,
            'time_limit_minutes' => $this->time_limit_minutes,
            'starts_at' => $this->starts_at?->toIso8601String(),
            'closes_at' => $this->closes_at?->toIso8601String(),
            'attempt_limit' => $this->attempt_limit,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'my_submission' => $latestSubmission ? [
                'id' => $latestSubmission->id,
                'attempt_number' => $latestSubmission->attempt_number,
                'response_text' => $latestSubmission->response_text,
                'has_file' => (bool) $latestSubmission->file_path,
                'file_original_name' => $latestSubmission->file_original_name,
                'answers' => $latestSubmission->answers,
                'submitted_at' => $latestSubmission->submitted_at?->toIso8601String(),
            ] : null,
            'result' => ($this->result_visible_to_candidate && $latestSubmission?->score) ? [
                'score' => $latestSubmission->score->score,
                'max_score' => $latestSubmission->score->max_score,
            ] : null,
        ];
    }
}
