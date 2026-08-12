<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Solution extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'summary',
        'icon',
        'hero_heading',
        'hero_description',
        'problem_statement',
        'our_approach',
        'services',
        'outputs',
        'tools',
        'order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'services' => 'array',
            'outputs' => 'array',
            'tools' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class);
    }

    public function articles(): BelongsToMany
    {
        return $this->belongsToMany(Article::class);
    }

    public function consultationBookings(): HasMany
    {
        return $this->hasMany(ConsultationBooking::class, 'related_solution_id');
    }
}
