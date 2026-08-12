<?php

namespace App\Models;

use App\Enums\JobApplicationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobApplication extends Model
{
    protected $fillable = [
        'vacancy_id',
        'applicant_name',
        'email',
        'phone',
        'cv_path',
        'cover_letter_path',
        'portfolio_url',
        'status',
        'internal_notes',
        'reviewed_by',
    ];

    protected function casts(): array
    {
        return [
            'status' => JobApplicationStatus::class,
        ];
    }

    /** Nullable: a speculative "Future Opportunities" application has no vacancy. */
    public function vacancy(): BelongsTo
    {
        return $this->belongsTo(Vacancy::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
