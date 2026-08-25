<?php

namespace App\Models;

use App\Enums\OrganisationStatus;
use Database\Factories\OrganisationFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Organisation extends Model
{
    /** @use HasFactory<OrganisationFactory> */
    use HasFactory, HasUlids;

    protected $fillable = [
        'name',
        'slug',
        'legal_name',
        'trading_name',
        'organisation_type',
        'sector',
        'country',
        'state',
        'registered_address',
        'website',
        'official_email_domain',
        'contact_person_name',
        'contact_person_position',
        'contact_person_phone',
        'registration_number',
        'tax_regulatory_info',
        'profile_description',
        'recruitment_needs',
        'terms_agreed',
        'terms_agreed_at',
        'status',
        'verified_at',
        'verified_by',
    ];

    protected function casts(): array
    {
        return [
            'terms_agreed' => 'boolean',
            'terms_agreed_at' => 'datetime',
            'status' => OrganisationStatus::class,
            'verified_at' => 'datetime',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(OrganisationUser::class);
    }

    public function talentRequests(): HasMany
    {
        return $this->hasMany(TalentRequest::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
