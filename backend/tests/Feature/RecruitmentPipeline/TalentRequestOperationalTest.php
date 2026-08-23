<?php

namespace Tests\Feature\RecruitmentPipeline;

use App\Enums\RsRole;
use App\Models\Organisation;
use App\Models\OrganisationUser;
use App\Models\TalentRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class TalentRequestOperationalTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function an_organisation_can_create_and_view_its_own_talent_request(): void
    {
        $organisation = Organisation::factory()->verified()->create();
        $orgUser = OrganisationUser::factory()->create(['organisation_id' => $organisation->id]);
        $token = $orgUser->createToken('organisation-session')->plainTextToken;

        $create = $this->withToken($token)->postJson('/api/organisation/talent-requests', [
            'service_type' => 'talent_hunt',
            'title' => 'Programme Officer',
            'description' => 'A description of the role and requirements.',
        ]);
        $create->assertStatus(201);
        $id = $create->json('data.id');

        $this->withToken($token)->getJson("/api/organisation/talent-requests/{$id}")
            ->assertStatus(200)
            ->assertJsonPath('data.id', $id);
    }

    /** @test */
    public function an_organisation_cannot_create_a_talent_request_for_a_different_organisation(): void
    {
        $organisationA = Organisation::factory()->verified()->create();
        $organisationB = Organisation::factory()->verified()->create();
        $orgUserA = OrganisationUser::factory()->create(['organisation_id' => $organisationA->id]);
        $token = $orgUserA->createToken('organisation-session')->plainTextToken;

        $this->withToken($token)->postJson('/api/organisation/talent-requests', [
            'organisation_id' => $organisationB->id,
            'service_type' => 'talent_hunt',
            'title' => 'Spoofed Request',
            'description' => 'Attempting to spoof organisation_id in the payload.',
        ])->assertStatus(201);

        $this->assertSame(
            $organisationA->id,
            TalentRequest::first()->organisation_id,
            'The organisation_id must always be derived from the authenticated actor, never trusted from the request body.'
        );
    }

    /** @test */
    public function an_organisation_cannot_view_another_organisations_talent_request(): void
    {
        $organisationA = Organisation::factory()->verified()->create();
        $organisationB = Organisation::factory()->verified()->create();
        $orgUserA = OrganisationUser::factory()->create(['organisation_id' => $organisationA->id]);
        $tokenA = $orgUserA->createToken('organisation-session')->plainTextToken;

        $requestB = TalentRequest::create([
            'organisation_id' => $organisationB->id,
            'service_type' => 'talent_hunt',
            'title' => 'Confidential Org B Role',
            'description' => 'Org B internal description.',
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $this->withToken($tokenA)->getJson("/api/organisation/talent-requests/{$requestB->id}")
            ->assertStatus(403);
    }

    /** @test */
    public function an_unauthenticated_request_cannot_create_a_talent_request(): void
    {
        $this->postJson('/api/organisation/talent-requests', [
            'service_type' => 'talent_hunt',
            'title' => 'Programme Officer',
            'description' => 'A description of the role and requirements.',
        ])->assertStatus(401);
    }

    /** @test */
    public function a_recruiter_can_assign_themselves_to_a_submitted_talent_request(): void
    {
        $organisation = Organisation::factory()->verified()->create();
        $talentRequest = TalentRequest::create([
            'organisation_id' => $organisation->id,
            'service_type' => 'talent_hunt',
            'title' => 'Programme Officer',
            'description' => 'A description of the role and requirements.',
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        $token = $recruiter->createToken('admin-session')->plainTextToken;

        $this->withToken($token)
            ->patchJson("/api/admin/talent-requests/{$talentRequest->id}/assign-recruiter", ['recruiter_id' => $recruiter->id])
            ->assertStatus(200)
            ->assertJsonPath('data.assigned_recruiter_id', $recruiter->id);

        Auth::forgetGuards();
    }
}
