<?php

namespace App\Models;

use App\Enums\OpportunityInvitationStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OpportunityInvitation extends Model
{
    use HasUlids;

    protected $fillable = [
        'candidate_pipeline_entry_id',
        'status',
        'sent_at',
        'responded_at',
        'expires_at',
        'decline_reason',
    ];

    protected function casts(): array
    {
        return [
            'status' => OpportunityInvitationStatus::class,
            'sent_at' => 'datetime',
            'responded_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function entry(): BelongsTo
    {
        return $this->belongsTo(CandidatePipelineEntry::class, 'candidate_pipeline_entry_id');
    }
}
