<?php

namespace Tests\Feature\Organisation;

use App\Models\Organisation;
use App\Models\OrganisationUser;
use App\Models\TalentRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * expert-network.txt, "MULTI-TENANT ISOLATION": "One organisation must
 * never see another organisation's ... requests ... Enforce tenant
 * isolation at the server and database-query levels. Do not rely only on
 * frontend filtering." Every attack attempted here goes through the real
 * HTTP/routing/policy pipeline, not a unit-level shortcut.
 */
class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function organisation_a_cannot_view_organisation_bs_talent_request(): void
    {
        $orgA = Organisation::factory()->create();
        $orgB = Organisation::factory()->create();

        $userA = OrganisationUser::factory()->create(['organisation_id' => $orgA->id]);
        $requestB = TalentRequest::create([
            'organisation_id' => $orgB->id,
            'service_type' => 'talent_hunt',
            'title' => 'Confidential Org B Role',
            'description' => 'Org B internal description.',
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $tokenA = $userA->createToken('organisation-session')->plainTextToken;

        $this->withToken($tokenA)
            ->getJson("/api/organisation/talent-requests/{$requestB->id}")
            ->assertStatus(403);
    }

    /** @test */
    public function organisation_as_request_index_never_includes_organisation_bs_requests(): void
    {
        $orgA = Organisation::factory()->create();
        $orgB = Organisation::factory()->create();

        $userA = OrganisationUser::factory()->create(['organisation_id' => $orgA->id]);

        TalentRequest::create([
            'organisation_id' => $orgA->id,
            'service_type' => 'talent_hunt',
            'title' => 'Org A Role',
            'description' => 'desc',
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);
        TalentRequest::create([
            'organisation_id' => $orgB->id,
            'service_type' => 'talent_hunt',
            'title' => 'Org B Role',
            'description' => 'desc',
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $tokenA = $userA->createToken('organisation-session')->plainTextToken;
        $response = $this->withToken($tokenA)->getJson('/api/organisation/talent-requests');

        $response->assertStatus(200)->assertJsonCount(1, 'data');
        $response->assertJsonFragment(['title' => 'Org A Role']);
        $response->assertJsonMissing(['title' => 'Org B Role']);
    }

    /** @test */
    public function organisation_a_cannot_manage_organisation_bs_team_members(): void
    {
        $orgA = Organisation::factory()->create();
        $orgB = Organisation::factory()->create();

        $userA = OrganisationUser::factory()->create(['organisation_id' => $orgA->id]);
        $userB = OrganisationUser::factory()->create(['organisation_id' => $orgB->id]);

        $tokenA = $userA->createToken('organisation-session')->plainTextToken;

        // Org A's own user index must never include Org B's users.
        $response = $this->withToken($tokenA)->getJson('/api/organisation/users');
        $response->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('id');
        $this->assertFalse($ids->contains($userB->id), 'Organisation A must not see Organisation B\'s team members.');

        // Attempting to deactivate a user belonging to a different
        // organisation by guessing the ID must fail, not silently succeed.
        $this->withToken($tokenA)
            ->deleteJson("/api/organisation/users/{$userB->id}")
            ->assertStatus(404);

        $this->assertDatabaseHas('organisation_users', ['id' => $userB->id, 'is_active' => true]);
    }

    /** @test */
    public function an_organisation_user_cannot_create_a_talent_request_for_a_different_organisation_by_id_spoofing(): void
    {
        $orgA = Organisation::factory()->create();
        $orgB = Organisation::factory()->create();
        $userA = OrganisationUser::factory()->create(['organisation_id' => $orgA->id]);

        $tokenA = $userA->createToken('organisation-session')->plainTextToken;

        // organisation_id is never accepted from the request body — the
        // controller always derives it from the authenticated principal.
        $response = $this->withToken($tokenA)->postJson('/api/organisation/talent-requests', [
            'organisation_id' => $orgB->id,
            'service_type' => 'talent_hunt',
            'title' => 'Attempted Spoof',
            'description' => 'desc',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('talent_requests', [
            'title' => 'Attempted Spoof',
            'organisation_id' => $orgA->id,
        ]);
        $this->assertDatabaseMissing('talent_requests', [
            'title' => 'Attempted Spoof',
            'organisation_id' => $orgB->id,
        ]);
    }
}
