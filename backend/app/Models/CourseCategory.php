<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourseCategory extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'order',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }
}
