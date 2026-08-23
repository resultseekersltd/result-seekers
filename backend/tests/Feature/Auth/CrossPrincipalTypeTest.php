<?php

namespace Tests\Feature\Auth;

use App\Models\ExpertUser;
use App\Models\OrganisationUser;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * A Sanctum bearer token is valid for whichever principal type issued it —
 * these tests confirm EnsureIsAdmin / EnsureIsExpertUser / EnsureIsRsStaff /
 * EnsureIsOrganisationUser correctly reject a token issued to a *different*
 * principal type, even when the token itself carries full ('*') abilities.
 * Extended in Phase 1 for the new OrganisationUser principal.
 */
class CrossPrincipalTypeTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function an_admin_token_cannot_access_expert_pool_routes(): void
    {
        $admin = User::factory()->create();
        $token = $admin->createToken('admin-session')->plainTextToken;

        $this->withToken($token)->getJson('/api/expert-pool/profile')->assertStatus(403);
        $this->withToken($token)->getJson('/api/expert-pool/experiences')->assertStatus(403);
    }

    /** @test */
    public function an_expert_token_cannot_access_admin_routes(): void
    {
        $expert = ExpertUser::factory()->create();
        $token = $expert->createToken('expert-session')->plainTextToken;

        $this->withToken($token)->getJson('/api/admin/me')->assertStatus(403);
        $this->withToken($token)->getJson('/api/admin/solutions')->assertStatus(403);
    }

    /** @test */
    public function an_unauthenticated_request_is_rejected_by_both_portals(): void
    {
        $this->getJson('/api/expert-pool/profile')->assertStatus(401);
        $this->getJson('/api/admin/me')->assertStatus(401);
    }

    /** @test */
    public function an_expert_token_cannot_access_organisation_routes(): void
    {
        $expert = ExpertUser::factory()->create();
        $token = $expert->createToken('expert-session')->plainTextToken;

        $this->withToken($token)->getJson('/api/organisation/me')->assertStatus(403);
        $this->withToken($token)->getJson('/api/organisation/talent-requests')->assertStatus(403);
    }

    /** @test */
    public function an_organisation_token_cannot_access_expert_pool_data(): void
    {
        $orgUser = OrganisationUser::factory()->create();
        $token = $orgUser->createToken('organisation-session')->plainTextToken;

        $this->withToken($token)->getJson('/api/expert-pool/profile')->assertStatus(403);
        $this->withToken($token)->getJson('/api/expert-pool/cv/download')->assertStatus(403);
    }

    /** @test */
    public function an_organisation_token_cannot_access_admin_routes(): void
    {
        $orgUser = OrganisationUser::factory()->create();
        $token = $orgUser->createToken('organisation-session')->plainTextToken;

        $this->withToken($token)->getJson('/api/admin/me')->assertStatus(403);
        $this->withToken($token)->getJson('/api/admin/organisations')->assertStatus(403);
        $this->withToken($token)->getJson('/api/admin/recruiter-search')->assertStatus(403);
    }

    /** @test */
    public function an_admin_token_cannot_access_organisation_routes(): void
    {
        $admin = User::factory()->create();
        $token = $admin->createToken('admin-session')->plainTextToken;

        $this->withToken($token)->getJson('/api/organisation/me')->assertStatus(403);
    }

    /** @test */
    public function an_unauthenticated_request_is_rejected_by_the_organisation_portal(): void
    {
        $this->getJson('/api/organisation/me')->assertStatus(401);
        $this->getJson('/api/admin/organisations')->assertStatus(401);
    }
}
