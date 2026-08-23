<?php

namespace App\Models;

use App\Enums\RecruitmentAssignmentStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class RecruitmentAssignment extends Model
{
    use HasUlids;

    protected $fillable = [
        'talent_request_id',
        'organisation_id',
        'recruiter_id',
        'reference',
        'status',
        'opened_at',
        'completed_at',
        'cancelled_at',
        'archived_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => RecruitmentAssignmentStatus::class,
            'opened_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $assignment) {
            $assignment->reference ??= self::generateReference();
        });
    }

    public static function generateReference(): string
    {
        do {
            $candidate = 'RA-'.now()->format('Y').'-'.strtoupper(Str::random(6));
        } while (self::where('reference', $candidate)->exists());

        return $candidate;
    }

    public function talentRequest(): BelongsTo
    {
        return $this->belongsTo(TalentRequest::class);
    }

    public function organisation(): BelongsTo
    {
        return $this->belongsTo(Organisation::class);
    }

    public function recruiter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recruiter_id');
    }

    public function pipelineEntries(): HasMany
    {
        return $this->hasMany(CandidatePipelineEntry::class);
    }
}
