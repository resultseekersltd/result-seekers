<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StrategicLeadershipPartner extends Model
{
    protected $fillable = [
        'strategic_partner_application_id',
        'full_name',
        'headline',
        'bio',
        'photo_path',
        'linkedin_url',
        'is_published',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(StrategicPartnerApplication::class, 'strategic_partner_application_id');
    }
}
