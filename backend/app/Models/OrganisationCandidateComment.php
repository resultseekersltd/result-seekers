<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrganisationCandidateComment extends Model
{
    use HasUlids;

    protected $fillable = [
        'data_release_id',
        'organisation_user_id',
        'comment',
    ];

    public function dataRelease(): BelongsTo
    {
        return $this->belongsTo(DataRelease::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(OrganisationUser::class, 'organisation_user_id');
    }
}
