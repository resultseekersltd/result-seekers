<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DataRelease extends Model
{
    use HasUlids;

    protected $fillable = [
        'candidate_consent_id',
        'released_to_organisation_id',
        'released_by',
        'released_fields',
        'purpose',
        'released_at',
        'organisation_status',
    ];

    protected function casts(): array
    {
        return [
            'released_fields' => 'array',
            'released_at' => 'datetime',
        ];
    }

    public function consent(): BelongsTo
    {
        return $this->belongsTo(CandidateConsent::class, 'candidate_consent_id');
    }

    public function organisation(): BelongsTo
    {
        return $this->belongsTo(Organisation::class, 'released_to_organisation_id');
    }

    public function releasedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'released_by');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(OrganisationCandidateComment::class)->latest();
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(CandidateEvaluation::class);
    }
}
