<?php

namespace App\Models;

use App\Enums\CandidateConsentStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Phase 1 schema, made operational in Phase 2 (see
 * Api\ExpertPool\OpportunityController). Rows are never overwritten to
 * represent a "current" decision; a withdrawal or a fresh request for a
 * different purpose is a new row, so the full history of consent
 * decisions for a profile is always reconstructable, matching
 * talent-expert.txt's "Do not silently overwrite previous consent events."
 * A candidate's consent is specific to the opportunity it concerns
 * (candidate_pipeline_entry_id) — never treated as blanket consent for
 * unrelated requests, matching expert-network.txt's "A candidate's
 * consent for one proposal must not be treated as general consent for
 * unrelated proposals."
 */
class CandidateConsent extends Model
{
    use HasUlids;

    protected $fillable = [
        'expert_pool_profile_id',
        'organisation_id',
        'talent_request_id',
        'candidate_pipeline_entry_id',
        'purpose',
        'consent_text_version',
        'status',
        'requested_at',
        'responded_at',
        'consented_at',
        'declined_at',
        'withdrawn_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => CandidateConsentStatus::class,
            'requested_at' => 'datetime',
            'responded_at' => 'datetime',
            'consented_at' => 'datetime',
            'declined_at' => 'datetime',
            'withdrawn_at' => 'datetime',
        ];
    }

    public function profile(): BelongsTo
    {
        return $this->belongsTo(ExpertPoolProfile::class, 'expert_pool_profile_id');
    }

    public function organisation(): BelongsTo
    {
        return $this->belongsTo(Organisation::class);
    }

    public function talentRequest(): BelongsTo
    {
        return $this->belongsTo(TalentRequest::class);
    }

    public function pipelineEntry(): BelongsTo
    {
        return $this->belongsTo(CandidatePipelineEntry::class, 'candidate_pipeline_entry_id');
    }

    public function releases(): HasMany
    {
        return $this->hasMany(DataRelease::class);
    }
}
