<?php

namespace App\Models;

use App\Enums\CourseDeliveryMode;
use App\Enums\CourseTrack;
use App\Enums\PublicationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Course extends Model
{
    protected $fillable = [
        'course_category_id',
        'slug',
        'title',
        'summary',
        'description',
        'track',
        'delivery_mode',
        'duration_text',
        'status',
        'is_featured',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'track' => CourseTrack::class,
            'delivery_mode' => CourseDeliveryMode::class,
            'status' => PublicationStatus::class,
            'is_featured' => 'boolean',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(CourseCategory::class, 'course_category_id');
    }
}
