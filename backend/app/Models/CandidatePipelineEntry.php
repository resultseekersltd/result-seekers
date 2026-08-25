<?php

namespace App\Models;

use App\Enums\CandidatePipelineOutcome;
use App\Enums\CandidatePipelineStage;
use App\Enums\QualityReviewDecision;
use App\Enums\ScreeningDecision;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CandidatePipelineEntry extends Model
{
    use HasUlids;

    protected $fillable = [
        'recruitment_assignment_id',
        'expert_pool_profile_id',
        'stage',
        'outcome',
        'outcome_reason',
        'recruiter_notes',
        'screening_decision',
        'screening_notes',
        'screened_by',
        'screened_at',
        'quality_review_decision',
        'quality_review_notes',
        'quality_reviewed_by',
        'quality_reviewed_at',
        'added_by',
    ];

    protected function casts(): array
    {
        return [
            'stage' => CandidatePipelineStage::class,
            'outcome' => CandidatePipelineOutcome::class,
            'screening_decision' => ScreeningDecision::class,
            'screened_at' => 'datetime',
            'quality_review_decision' => QualityReviewDecision::class,
            'quality_reviewed_at' => 'datetime',
        ];
    }

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(RecruitmentAssignment::class, 'recruitment_assignment_id');
    }

    public function profile(): BelongsTo
    {
        return $this->belongsTo(ExpertPoolProfile::class, 'expert_pool_profile_id');
    }

    public function screener(): BelongsTo
    {
        return $this->belongsTo(User::class, 'screened_by');
    }

    public function qualityReviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'quality_reviewed_by');
    }

    public function addedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'added_by');
    }

    public function stageHistory(): HasMany
    {
        return $this->hasMany(CandidatePipelineStageHistory::class)->latest();
    }

    public function invitation(): HasOne
    {
        return $this->hasOne(OpportunityInvitation::class);
    }

    public function consents(): HasMany
    {
        return $this->hasMany(CandidateConsent::class);
    }

    public function verificationCases(): HasMany
    {
        return $this->hasMany(VerificationCase::class);
    }

    public function assessments(): HasMany
    {
        return $this->hasMany(Assessment::class);
    }

    public function interviews(): HasMany
    {
        return $this->hasMany(Interview::class);
    }

    public function referenceChecks(): HasMany
    {
        return $this->hasMany(ReferenceCheck::class);
    }

    public function placement(): HasOne
    {
        return $this->hasOne(Placement::class);
    }

    /**
     * Moves the entry to a new stage, appending an immutable history row.
     * The one place stage transitions should ever happen from — callers
     * should not set `stage` directly via update().
     */
    public function transitionTo(CandidatePipelineStage $stage, ?User $actor = null, ?string $notes = null): void
    {
        $from = $this->stage;

        $this->update(['stage' => $stage]);

        CandidatePipelineStageHistory::create([
            'candidate_pipeline_entry_id' => $this->id,
            'from_stage' => $from?->value,
            'to_stage' => $stage->value,
            'changed_by' => $actor?->id,
            'notes' => $notes,
        ]);
    }
}
