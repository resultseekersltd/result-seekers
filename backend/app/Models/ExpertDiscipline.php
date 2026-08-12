<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ExpertDiscipline extends Model
{
    protected $fillable = [
        'slug',
        'name',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function applications(): BelongsToMany
    {
        return $this->belongsToMany(ExpertApplication::class, 'expert_application_discipline');
    }

    public function profiles(): BelongsToMany
    {
        return $this->belongsToMany(ExpertProfile::class, 'expert_profile_discipline');
    }
}
