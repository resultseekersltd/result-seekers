<?php

namespace App\Models;

use App\Enums\InterviewRecommendation;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class InterviewScorecard extends Model
{
    use HasUlids;

    protected $fillable = [
        'interview_id',
        'panelist_type',
        'panelist_id',
        'competency_scores',
        'panel_comments',
        'overall_recommendation',
        'conflict_of_interest',
        'conflict_of_interest_notes',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'competency_scores' => 'array',
            'overall_recommendation' => InterviewRecommendation::class,
            'conflict_of_interest' => 'boolean',
            'submitted_at' => 'datetime',
        ];
    }

    public function interview(): BelongsTo
    {
        return $this->belongsTo(Interview::class);
    }

    public function panelist(): MorphTo
    {
        return $this->morphTo();
    }
}
