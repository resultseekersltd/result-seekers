<?php

namespace App\Models;

use App\Enums\ProductStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'category',
        'short_description',
        'description',
        'status',
        'external_url',
        'target_users',
        'features',
        'logo_path',
        'order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'status' => ProductStatus::class,
            'target_users' => 'array',
            'features' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function solutions(): BelongsToMany
    {
        return $this->belongsToMany(Solution::class);
    }

    public function contactSubmissions(): HasMany
    {
        return $this->hasMany(ContactSubmission::class, 'related_product_id');
    }
}
