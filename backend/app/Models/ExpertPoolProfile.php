<?php

namespace App\Models;

use App\Enums\ExpertPoolProfileStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExpertPoolProfile extends Model
{
    protected $fillable = [
        'expert_user_id',
        'preferred_name',
        'phone',
        'country',
        'state',
        'city',
        'photo_path',
        'professional_title',
        'current_organization',
        'years_experience',
        'highest_qualification',
        'field_of_study',
        'bio',
        'skills',
        'industries',
        'languages',
        'certifications',
        'cv_path',
        'cv_original_name',
        'cv_uploaded_at',
        'status',
        'submitted_at',
        'reviewed_at',
        'reviewed_by',
    ];

    protected function casts(): array
    {
        return [
            'skills' => 'array',
            'industries' => 'array',
            'languages' => 'array',
            'certifications' => 'array',
            'cv_uploaded_at' => 'datetime',
            'status' => ExpertPoolProfileStatus::class,
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    public function expertUser(): BelongsTo
    {
        return $this->belongsTo(ExpertUser::class);
    }

    public function disciplines(): BelongsToMany
    {
        return $this->belongsToMany(ExpertDiscipline::class, 'expert_pool_profile_discipline');
    }

    public function experiences(): HasMany
    {
        return $this->hasMany(ExpertExperience::class)->orderByDesc('start_date');
    }

    public function education(): HasMany
    {
        return $this->hasMany(ExpertEducation::class)->orderByDesc('start_year');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Required fields for a "complete" profile, weighted equally, plus at
     * least one experience entry, one education entry, and a CV. Computed
     * live from real data — never hardcoded or fixed at a stage value.
     *
     * @return array{percentage: int, missing: list<string>}
     */
    public function completion(): array
    {
        $requiredFields = [
            'Preferred name' => $this->preferred_name,
            'Phone number' => $this->phone,
            'Country' => $this->country,
            'Professional title' => $this->professional_title,
            'Current organization' => $this->current_organization,
            'Years of experience' => $this->years_experience,
            'Highest qualification' => $this->highest_qualification,
            'Professional biography' => $this->bio,
        ];

        // 4 extra requirements beyond the simple scalar fields above: expertise, experience, education, CV.
        $total = count($requiredFields) + 4;
        $missing = [];
        $filled = 0;

        foreach ($requiredFields as $label => $value) {
            if (filled($value)) {
                $filled++;
            } else {
                $missing[] = $label;
            }
        }

        if ($this->disciplines()->exists()) {
            $filled++;
        } else {
            $missing[] = 'Areas of expertise';
        }

        if ($this->experiences()->exists()) {
            $filled++;
        } else {
            $missing[] = 'At least one experience entry';
        }

        if ($this->education()->exists()) {
            $filled++;
        } else {
            $missing[] = 'At least one education entry';
        }

        if (filled($this->cv_path)) {
            $filled++;
        } else {
            $missing[] = 'CV upload';
        }

        return [
            'percentage' => (int) round(($filled / $total) * 100),
            'missing' => $missing,
        ];
    }

    public function isComplete(): bool
    {
        return $this->completion()['percentage'] === 100;
    }
}
