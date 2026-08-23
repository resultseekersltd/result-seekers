<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Immutable — rows are only ever created, never updated or deleted. */
class CandidatePipelineStageHistory extends Model
{
    use HasUlids;

    protected $fillable = [
        'candidate_pipeline_entry_id',
        'from_stage',
        'to_stage',
        'changed_by',
        'notes',
    ];

    public function entry(): BelongsTo
    {
        return $this->belongsTo(CandidatePipelineEntry::class, 'candidate_pipeline_entry_id');
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
