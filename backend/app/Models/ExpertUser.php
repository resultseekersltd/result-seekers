<?php

namespace App\Models;

use App\Notifications\ExpertPool\ExpertResetPassword;
use App\Notifications\ExpertPool\ExpertVerifyEmail;
use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Contracts\Auth\MustVerifyEmail as MustVerifyEmailContract;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Authenticated Expert Pool account — deliberately separate from `users`
 * (the admin/staff table). Shares Sanctum's polymorphic
 * `personal_access_tokens` table with `User`; routes are separated by an
 * `EnsureIsExpertUser` middleware type-check rather than a named auth
 * guard (see Task 007-era `add_role_to_users_table` migration comment,
 * which reserved `users` for admin/staff and flagged this as future work).
 */
class ExpertUser extends Authenticatable implements CanResetPasswordContract, MustVerifyEmailContract
{
    use CanResetPassword, HasApiTokens, MustVerifyEmailTrait, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
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
            'is_active' => 'boolean',
            'mfa_enabled' => 'boolean',
            'mfa_secret' => 'encrypted',
        ];
    }

    public function profile(): HasOne
    {
        return $this->hasOne(ExpertPoolProfile::class);
    }

    public function recoveryCodes(): HasMany
    {
        return $this->hasMany(ExpertRecoveryCode::class);
    }

    /** Routes the verification email through our own signed frontend link instead of Laravel's default web route. */
    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new ExpertVerifyEmail);
    }

    /** Routes the reset email through our own frontend link instead of Laravel's default web route. */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ExpertResetPassword($token));
    }
}
