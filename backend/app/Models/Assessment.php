<?php

namespace App\Models;

use App\Enums\AssessmentStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Phase 3 "ASSESSMENTS". The definition + assignment only — the
 * candidate's answer lives in AssessmentSubmission, the reviewer's score
 * in AssessmentScore (see the migration's docblock for why these stay
 * separate rows rather than one overloaded row).
 */
class Assessment extends Model
{
    use HasUlids;

    protected $fillable = [
        'candidate_pipeline_entry_id',
        'type',
        'title',
        'instructions',
        'time_limit_minutes',
        'starts_at',
        'closes_at',
        'attempt_limit',
        'scoring_rules',
        'status',
        'result_visible_to_candidate',
        'assigned_by',
        'reviewer_id',
    ];

    protected function casts(): array
    {
        return [
            'status' => AssessmentStatus::class,
            'starts_at' => 'datetime',
            'closes_at' => 'datetime',
            'scoring_rules' => 'array',
            'result_visible_to_candidate' => 'boolean',
        ];
    }

    public function pipelineEntry(): BelongsTo
    {
        return $this->belongsTo(CandidatePipelineEntry::class, 'candidate_pipeline_entry_id');
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(AssessmentSubmission::class);
    }
}
