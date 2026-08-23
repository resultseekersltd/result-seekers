<?php

namespace App\Http\Resources\Organisation;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CandidateEvaluationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'data_release_id' => $this->data_release_id,
            'organisation_user_id' => $this->organisation_user_id,
            'evaluator_name' => $this->whenLoaded('organisationUser', fn () => $this->organisationUser?->name),
            'score' => $this->score,
            'criteria_notes' => $this->criteria_notes,
            'recommendation' => $this->recommendation,
            'final_outcome' => $this->final_outcome?->value,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
