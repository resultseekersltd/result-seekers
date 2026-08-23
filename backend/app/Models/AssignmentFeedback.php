<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/** `submitter` is App\Models\OrganisationUser or App\Models\ExpertUser — symmetric feedback, no new principal type. */
class AssignmentFeedback extends Model
{
    use HasUlids;

    protected $fillable = [
        'placement_id',
        'submitter_type',
        'submitter_id',
        'rating',
        'comments',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'submitted_at' => 'datetime',
        ];
    }

    public function placement(): BelongsTo
    {
        return $this->belongsTo(Placement::class);
    }

    public function submitter(): MorphTo
    {
        return $this->morphTo();
    }
}
