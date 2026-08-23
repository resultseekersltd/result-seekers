<?php

namespace Database\Factories;

use App\Enums\OrganisationRole;
use App\Models\Organisation;
use App\Models\OrganisationUser;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<OrganisationUser>
 */
class OrganisationUserFactory extends Factory
{
    protected $model = OrganisationUser::class;

    protected static ?string $password;

    public function definition(): array
    {
        return [
            'organisation_id' => Organisation::factory(),
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => OrganisationRole::Representative,
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

    public function withMfa(string $secret = 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD'): static
    {
        return $this->state(fn (array $attributes) => [
            'mfa_enabled' => true,
            'mfa_secret' => $secret,
        ]);
    }
}
