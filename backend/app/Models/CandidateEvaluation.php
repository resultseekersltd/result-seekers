<?php

namespace App\Models;

use App\Enums\CandidateEvaluationOutcome;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CandidateEvaluation extends Model
{
    use HasUlids;

    protected $fillable = [
        'data_release_id',
        'organisation_user_id',
        'score',
        'criteria_notes',
        'recommendation',
        'final_outcome',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'decimal:2',
            'final_outcome' => CandidateEvaluationOutcome::class,
        ];
    }

    public function release(): BelongsTo
    {
        return $this->belongsTo(DataRelease::class, 'data_release_id');
    }

    public function organisationUser(): BelongsTo
    {
        return $this->belongsTo(OrganisationUser::class);
    }
}
