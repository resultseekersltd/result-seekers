<?php

namespace App\Models;

use App\Enums\VerificationCheckStatus;
use App\Enums\VerificationLevel;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VerificationCase extends Model
{
    use HasUlids;

    protected $fillable = [
        'expert_pool_profile_id',
        'candidate_pipeline_entry_id',
        'target_level',
        'status',
        'opened_by',
        'opened_at',
        'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'target_level' => VerificationLevel::class,
            'status' => VerificationCheckStatus::class,
            'opened_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function profile(): BelongsTo
    {
        return $this->belongsTo(ExpertPoolProfile::class, 'expert_pool_profile_id');
    }

    public function opener(): BelongsTo
    {
        return $this->belongsTo(User::class, 'opened_by');
    }

    public function pipelineEntry(): BelongsTo
    {
        return $this->belongsTo(CandidatePipelineEntry::class, 'candidate_pipeline_entry_id');
    }

    public function checks(): HasMany
    {
        return $this->hasMany(VerificationCheck::class);
    }
}
