<?php

namespace App\Models;

use App\Enums\ConsultationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConsultationBooking extends Model
{
    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'organization',
        'related_solution_id',
        'preferred_date',
        'preferred_time',
        'message',
        'status',
        'internal_notes',
    ];

    protected function casts(): array
    {
        return [
            'status' => ConsultationStatus::class,
            'preferred_date' => 'date',
        ];
    }

    public function relatedSolution(): BelongsTo
    {
        return $this->belongsTo(Solution::class, 'related_solution_id');
    }
}
