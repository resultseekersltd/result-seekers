<?php

namespace App\Models;

use App\Enums\ReferenceCheckOutcome;
use App\Enums\ReferenceCheckStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** referee_contact and verification_notes are private — never part of any organisation-facing resource. */
class ReferenceCheck extends Model
{
    use HasUlids;

    protected $fillable = [
        'candidate_pipeline_entry_id',
        'referee_name',
        'referee_relationship',
        'referee_organisation',
        'contact_method',
        'referee_contact',
        'candidate_consented_at',
        'consent_text_version',
        'status',
        'requested_by',
        'date_contacted',
        'response_status',
        'verification_notes',
        'risk_flags',
        'final_outcome',
    ];

    protected function casts(): array
    {
        return [
            'status' => ReferenceCheckStatus::class,
            'final_outcome' => ReferenceCheckOutcome::class,
            'candidate_consented_at' => 'datetime',
            'date_contacted' => 'datetime',
        ];
    }

    public function pipelineEntry(): BelongsTo
    {
        return $this->belongsTo(CandidatePipelineEntry::class, 'candidate_pipeline_entry_id');
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }
}
