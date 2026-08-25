<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AssessmentSubmission extends Model
{
    use HasUlids;

    protected $fillable = [
        'assessment_id',
        'attempt_number',
        'response_text',
        'file_path',
        'file_original_name',
        'answers',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'answers' => 'array',
            'submitted_at' => 'datetime',
        ];
    }

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }

    public function score(): HasOne
    {
        return $this->hasOne(AssessmentScore::class);
    }
}
