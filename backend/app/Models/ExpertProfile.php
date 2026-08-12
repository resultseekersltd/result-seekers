<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ExpertProfile extends Model
{
    protected $fillable = [
        'expert_application_id',
        'full_name',
        'headline',
        'bio',
        'location',
        'years_experience',
        'photo_path',
        'portfolio_url',
        'linkedin_url',
        'is_published',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(ExpertApplication::class);
    }

    public function disciplines(): BelongsToMany
    {
        return $this->belongsToMany(ExpertDiscipline::class, 'expert_profile_discipline');
    }
}
