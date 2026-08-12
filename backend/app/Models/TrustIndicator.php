<?php

namespace App\Models;

use App\Enums\TrustIndicatorType;
use Illuminate\Database\Eloquent\Model;

class TrustIndicator extends Model
{
    protected $fillable = [
        'type',
        'value',
        'suffix',
        'label',
        'order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'type' => TrustIndicatorType::class,
            'is_active' => 'boolean',
        ];
    }
}
