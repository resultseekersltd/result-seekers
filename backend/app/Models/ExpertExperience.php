<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExpertExperience extends Model
{
    protected $fillable = [
        'expert_pool_profile_id',
        'organization',
        'job_title',
        'country',
        'start_date',
        'end_date',
        'is_current',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'is_current' => 'boolean',
        ];
    }

    public function profile(): BelongsTo
    {
        return $this->belongsTo(ExpertPoolProfile::class, 'expert_pool_profile_id');
    }
}
