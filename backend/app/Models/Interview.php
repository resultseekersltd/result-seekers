<?php

namespace App\Models;

use App\Enums\InterviewStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Interview extends Model
{
    use HasUlids;

    protected $fillable = [
        'candidate_pipeline_entry_id',
        'type',
        'scheduled_at',
        'timezone',
        'location_or_link',
        'status',
        'created_by',
        'candidate_confirmed_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => InterviewStatus::class,
            'scheduled_at' => 'datetime',
            'candidate_confirmed_at' => 'datetime',
        ];
    }

    public function pipelineEntry(): BelongsTo
    {
        return $this->belongsTo(CandidatePipelineEntry::class, 'candidate_pipeline_entry_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function panelMembers(): HasMany
    {
        return $this->hasMany(InterviewPanelMember::class);
    }

    public function scorecards(): HasMany
    {
        return $this->hasMany(InterviewScorecard::class);
    }
}
