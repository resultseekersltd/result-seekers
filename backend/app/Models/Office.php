<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Office extends Model
{
    protected $fillable = [
        'name',
        'city',
        'state',
        'address',
        'phone',
        'email',
        'latitude',
        'longitude',
        'is_headquarters',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'is_headquarters' => 'boolean',
        ];
    }
}
