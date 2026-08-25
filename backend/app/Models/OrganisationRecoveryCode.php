<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Mirrors AdminRecoveryCode / ExpertRecoveryCode exactly. */
class OrganisationRecoveryCode extends Model
{
    protected $fillable = [
        'organisation_user_id',
        'code_hash',
        'used_at',
    ];

    protected function casts(): array
    {
        return [
            'used_at' => 'datetime',
        ];
    }

    public function organisationUser(): BelongsTo
    {
        return $this->belongsTo(OrganisationUser::class);
    }
}
