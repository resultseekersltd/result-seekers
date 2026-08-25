<?php

namespace Database\Factories;

use App\Enums\OrganisationStatus;
use App\Models\Organisation;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Organisation>
 */
class OrganisationFactory extends Factory
{
    protected $model = Organisation::class;

    public function definition(): array
    {
        $name = fake()->unique()->company();

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::random(6),
            'country' => 'Nigeria',
            'status' => OrganisationStatus::PendingVerification,
            'terms_agreed' => true,
            'terms_agreed_at' => now(),
        ];
    }

    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrganisationStatus::Verified,
            'verified_at' => now(),
        ]);
    }
}
