<?php

namespace App\Models;

use App\Enums\VerificationCheckStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VerificationCheck extends Model
{
    use HasUlids;

    protected $fillable = [
        'verification_case_id',
        'check_type',
        'subject',
        'status',
        'verifier_id',
        'started_at',
        'completed_at',
        'evidence_reviewed',
        'method_used',
        'internal_notes',
        'expires_at',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'status' => VerificationCheckStatus::class,
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function case(): BelongsTo
    {
        return $this->belongsTo(VerificationCase::class, 'verification_case_id');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verifier_id');
    }
}
