<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExpertRecoveryCode extends Model
{
    protected $fillable = [
        'expert_user_id',
        'code_hash',
        'used_at',
    ];

    protected function casts(): array
    {
        return [
            'used_at' => 'datetime',
        ];
    }

    public function expertUser(): BelongsTo
    {
        return $this->belongsTo(ExpertUser::class);
    }
}
