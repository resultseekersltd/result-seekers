<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/** `panelist` is App\Models\User (RS staff) or App\Models\OrganisationUser — no new principal type. */
class InterviewPanelMember extends Model
{
    use HasUlids;

    protected $fillable = [
        'interview_id',
        'panelist_type',
        'panelist_id',
        'role',
        'invited_at',
    ];

    protected function casts(): array
    {
        return [
            'invited_at' => 'datetime',
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
