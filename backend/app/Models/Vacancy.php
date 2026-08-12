<?php

namespace App\Models;

use App\Enums\VacancyStatus;
use App\Enums\VacancyType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vacancy extends Model
{
    protected $fillable = [
        'type',
        'title',
        'slug',
        'department',
        'location',
        'summary',
        'description',
        'requirements',
        'application_deadline',
        'status',
        'is_featured',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'type' => VacancyType::class,
            'status' => VacancyStatus::class,
            'requirements' => 'array',
            'application_deadline' => 'date',
            'is_featured' => 'boolean',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }
}
