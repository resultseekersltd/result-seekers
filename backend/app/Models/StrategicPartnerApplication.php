<?php

namespace App\Models;

use App\Enums\StrategicPartnerApplicationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class StrategicPartnerApplication extends Model
{
    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'organization',
        'current_role',
        'contribution_areas',
        'motivation',
        'cv_path',
        'linkedin_url',
        'status',
        'internal_notes',
        'reviewed_by',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => StrategicPartnerApplicationStatus::class,
            'contribution_areas' => 'array',
            'reviewed_at' => 'datetime',
        ];
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /** The public directory entry created once this application is approved. */
    public function partner(): HasOne
    {
        return $this->hasOne(StrategicLeadershipPartner::class);
    }
}
