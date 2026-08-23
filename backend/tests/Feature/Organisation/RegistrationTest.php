<?php

namespace Tests\Feature\Organisation;

use App\Enums\OrganisationStatus;
use App\Models\Organisation;
use App\Models\OrganisationUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/**
 * Approved Phase 1 scope: "Self-registration with a verification gate."
 * The organisation is created pending — never auto-verified — and the
 * account is unusable until the representative's own email is verified,
 * mirroring ExpertPool's registration flow exactly.
 */
class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function registering_creates_a_pending_organisation_and_its_first_representative(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/organisation/register', [
            'organisation_name' => 'Acme Development Partners',
            'country' => 'Nigeria',
            'terms_agreed' => true,
            'contact_name' => 'Jane Doe',
            'email' => 'jane@acme.org',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201);

        $organisation = Organisation::where('name', 'Acme Development Partners')->firstOrFail();
        $this->assertSame(OrganisationStatus::PendingVerification, $organisation->status);
        $this->assertNull($organisation->verified_at);

        $user = OrganisationUser::where('email', 'jane@acme.org')->firstOrFail();
        $this->assertSame($organisation->id, $user->organisation_id);
        $this->assertNull($user->email_verified_at);
    }

    /** @test */
    public function an_unverified_user_cannot_log_in(): void
    {
        Notification::fake();

        $this->postJson('/api/organisation/register', [
            'organisation_name' => 'Unverified Org',
            'terms_agreed' => true,
            'contact_name' => 'Jane Doe',
            'email' => 'unverified@acme.org',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertStatus(201);

        $response = $this->postJson('/api/organisation/login', [
            'email' => 'unverified@acme.org',
            'password' => 'password123',
        ]);

        $response->assertStatus(403)->assertJson(['email_unverified' => true]);
    }

    /** @test */
    public function duplicate_email_registration_is_rejected(): void
    {
        OrganisationUser::factory()->create(['email' => 'taken@acme.org']);

        $response = $this->postJson('/api/organisation/register', [
            'organisation_name' => 'Another Org',
            'terms_agreed' => true,
            'contact_name' => 'Someone',
            'email' => 'taken@acme.org',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('email');
    }

    /** @test */
    public function registration_without_agreeing_to_terms_is_rejected(): void
    {
        $response = $this->postJson('/api/organisation/register', [
            'organisation_name' => 'No Terms Org',
            'terms_agreed' => false,
            'contact_name' => 'Someone',
            'email' => 'noterms@acme.org',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('terms_agreed');
    }
}
