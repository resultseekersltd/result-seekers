<?php

namespace App\Models;

use App\Enums\ExpertApplicationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ExpertApplication extends Model
{
    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'location',
        'years_experience',
        'cv_path',
        'portfolio_url',
        'linkedin_url',
        'bio_summary',
        'status',
        'internal_notes',
        'reviewed_by',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => ExpertApplicationStatus::class,
            'reviewed_at' => 'datetime',
        ];
    }

    public function disciplines(): BelongsToMany
    {
        return $this->belongsToMany(ExpertDiscipline::class, 'expert_application_discipline');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /** The public profile created once this application is approved. */
    public function profile(): HasOne
    {
        return $this->hasOne(ExpertProfile::class);
    }
}
