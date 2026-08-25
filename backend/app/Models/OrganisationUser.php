<?php

namespace App\Models;

use App\Concerns\HasPermissions;
use App\Enums\OrganisationRole;
use App\Notifications\Organisation\OrganisationResetPassword;
use App\Notifications\Organisation\OrganisationVerifyEmail;
use Database\Factories\OrganisationUserFactory;
use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Contracts\Auth\MustVerifyEmail as MustVerifyEmailContract;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Authenticated Organisation-side account — third principal type,
 * following the exact ExpertUser/User pattern (own table, integer PK for
 * Sanctum tokenable compatibility, shares the polymorphic
 * personal_access_tokens table). Deliberately not merged with User or
 * ExpertUser — see the Phase 1 readiness report's identity model section.
 */
class OrganisationUser extends Authenticatable implements CanResetPasswordContract, MustVerifyEmailContract
{
    /** @use HasFactory<OrganisationUserFactory> */
    use CanResetPassword, HasApiTokens, HasFactory, HasPermissions, MustVerifyEmailTrait, Notifiable;

    protected $fillable = [
        'organisation_id',
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'mfa_secret',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => OrganisationRole::class,
            'is_active' => 'boolean',
            'mfa_enabled' => 'boolean',
            'mfa_secret' => 'encrypted',
        ];
    }

    public function organisation(): BelongsTo
    {
        return $this->belongsTo(Organisation::class);
    }

    public function recoveryCodes(): HasMany
    {
        return $this->hasMany(OrganisationRecoveryCode::class);
    }

    /** Routes the verification email through our own signed frontend link, mirroring ExpertUser. */
    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new OrganisationVerifyEmail);
    }

    /** Routes the reset email through our own frontend link, mirroring ExpertUser. */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new OrganisationResetPassword($token));
    }
}
