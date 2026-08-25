<?php

namespace Database\Factories;

use App\Models\ExpertUser;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<ExpertUser>
 */
class ExpertUserFactory extends Factory
{
    protected $model = ExpertUser::class;

    protected static ?string $password;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'is_active' => true,
            'mfa_enabled' => false,
            'mfa_secret' => null,
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => ['email_verified_at' => null]);
    }

    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => ['is_active' => false]);
    }

    /** MFA enabled with a known, fixed TOTP secret so tests can generate valid codes. */
    public function withMfa(string $secret = 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD'): static
    {
        return $this->state(fn (array $attributes) => [
            'mfa_enabled' => true,
            'mfa_secret' => $secret,
        ]);
    }
}
