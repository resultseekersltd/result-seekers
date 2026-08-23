<?php

namespace App\Models;

use App\Enums\CandidatePipelineOutcome;
use App\Enums\PlacementStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Phase 4 "Placement". `status` only ever becomes Confirmed, and the
 * owning CandidatePipelineEntry's outcome only ever becomes `Placed`,
 * once both organisation_confirmed_at and professional_confirmed_at are
 * set — see checkAndMarkConfirmed(), the single place this transition is
 * allowed to happen, mirroring CandidatePipelineEntry::transitionTo()'s
 * "one sanctioned place" discipline.
 */
class Placement extends Model
{
    use HasUlids;

    protected $fillable = [
        'candidate_pipeline_entry_id',
        'engagement_type',
        'start_date',
        'end_date',
        'deployment_location',
        'deployment_notes',
        'onboarding_notes',
        'status',
        'organisation_confirmed_at',
        'organisation_confirmed_by',
        'professional_confirmed_at',
        'professional_confirmed_by',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'status' => PlacementStatus::class,
            'start_date' => 'date',
            'end_date' => 'date',
            'organisation_confirmed_at' => 'datetime',
            'professional_confirmed_at' => 'datetime',
        ];
    }

    public function pipelineEntry(): BelongsTo
    {
        return $this->belongsTo(CandidatePipelineEntry::class, 'candidate_pipeline_entry_id');
    }

    public function organisationConfirmedBy(): BelongsTo
    {
        return $this->belongsTo(OrganisationUser::class, 'organisation_confirmed_by');
    }

    public function professionalConfirmedBy(): BelongsTo
    {
        return $this->belongsTo(ExpertUser::class, 'professional_confirmed_by');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function feedback(): HasMany
    {
        return $this->hasMany(AssignmentFeedback::class);
    }

    public function isFullyConfirmed(): bool
    {
        return $this->organisation_confirmed_at !== null && $this->professional_confirmed_at !== null;
    }

    /**
     * The sole place Placement::status becomes Confirmed and
     * CandidatePipelineEntry::outcome becomes Placed. Idempotent — safe
     * to call after either confirmation, whether or not the other side
     * has confirmed yet. Requires the placement to still be
     * PendingConfirmation, not merely "not yet Confirmed" — otherwise a
     * Cancelled placement could be revived into Confirmed/Placed by a
     * stale confirmation recorded before cancellation (see Phase 4
     * acceptance audit).
     */
    public function checkAndMarkConfirmed(): void
    {
        if ($this->status !== PlacementStatus::PendingConfirmation || ! $this->isFullyConfirmed()) {
            return;
        }

        $this->update(['status' => PlacementStatus::Confirmed]);
        $this->pipelineEntry->update(['outcome' => CandidatePipelineOutcome::Placed]);
    }
}
