<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExpertEducation extends Model
{
    protected $fillable = [
        'expert_pool_profile_id',
        'institution',
        'qualification',
        'field_of_study',
        'start_year',
        'end_year',
        'country',
    ];

    public function profile(): BelongsTo
    {
        return $this->belongsTo(ExpertPoolProfile::class, 'expert_pool_profile_id');
    }
}
