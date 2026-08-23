<?php

namespace App\Models;

use App\Enums\TalentRequestStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class TalentRequest extends Model
{
    use HasUlids;

    protected $fillable = [
        'organisation_id',
        'organisation_user_id',
        'assigned_recruiter_id',
        'reference',
        'service_type',
        'title',
        'number_required',
        'location',
        'arrangement',
        'engagement_type',
        'duration',
        'start_date',
        'deadline',
        'description',
        'essential_qualifications',
        'desirable_qualifications',
        'years_experience_required',
        'required_skills',
        'budget_range',
        'confidentiality_level',
        'details',
        'status',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'deadline' => 'date',
            'required_skills' => 'array',
            'details' => 'array',
            'status' => TalentRequestStatus::class,
            'submitted_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $request) {
            $request->reference ??= self::generateReference();
        });
    }

    /** Opaque, human-readable reference — never the raw ULID — shown to organisation-facing users. */
    public static function generateReference(): string
    {
        do {
            $candidate = 'TR-'.now()->format('Y').'-'.strtoupper(Str::random(6));
        } while (self::where('reference', $candidate)->exists());

        return $candidate;
    }

    public function organisation(): BelongsTo
    {
        return $this->belongsTo(Organisation::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(OrganisationUser::class, 'organisation_user_id');
    }

    public function assignedRecruiter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_recruiter_id');
    }

    public function recruitmentAssignments(): HasMany
    {
        return $this->hasMany(RecruitmentAssignment::class);
    }
}
