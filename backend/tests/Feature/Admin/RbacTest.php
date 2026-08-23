<?php

namespace Tests\Feature\Admin;

use App\Enums\RsRole;
use App\Models\ExpertPoolProfile;
use App\Models\ExpertUser;
use App\Models\Organisation;
use App\Models\TalentRequest;
use App\Models\User;
use App\Models\VerificationCase;
use App\Models\VerificationCheck;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

/**
 * Role/permission boundaries derived from talent-expert.txt's per-role
 * capability lists (readiness report §21/§22, RolePermissions mapping).
 * Every RS-side principal in these tests is a real `User` row with a real
 * RsRole — EnsureIsRsStaff lets all four roles reach these routes, so the
 * enforcement under test is entirely the Permission::hasPermission() /
 * Policy layer, not the middleware.
 *
 * Auth::forgetGuards() is called between calls using different tokens
 * within one test — Sanctum's RequestGuard caches the resolved user on
 * the guard instance, which otherwise survives across sequential
 * test-client calls in a single test (the same issue Phase 0 hit and
 * documented in ExpertPool/MfaEnforcementTest.php).
 */
class RbacTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function a_recruiter_can_search_the_professional_database(): void
    {
        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        $token = $recruiter->createToken('admin-session')->plainTextToken;

        $this->withToken($token)->getJson('/api/admin/recruiter-search')->assertStatus(200);
    }

    /** @test */
    public function a_verifier_cannot_search_the_professional_database(): void
    {
        $verifier = User::factory()->create(['role' => RsRole::Verifier]);
        $token = $verifier->createToken('admin-session')->plainTextToken;

        $this->withToken($token)->getJson('/api/admin/recruiter-search')->assertStatus(403);
    }

    /** @test */
    public function a_recruitment_manager_can_verify_an_organisation_but_a_recruiter_cannot(): void
    {
        $organisation = Organisation::factory()->create();

        $manager = User::factory()->create(['role' => RsRole::RecruitmentManager]);
        $managerToken = $manager->createToken('admin-session')->plainTextToken;

        $this->withToken($managerToken)
            ->patchJson("/api/admin/organisations/{$organisation->id}/status", ['status' => 'verified'])
            ->assertStatus(200);

        Auth::forgetGuards();
        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        $recruiterToken = $recruiter->createToken('admin-session')->plainTextToken;

        $this->withToken($recruiterToken)
            ->patchJson("/api/admin/organisations/{$organisation->id}/status", ['status' => 'suspended'])
            ->assertStatus(403);
    }

    /** @test */
    public function a_recruiter_cannot_review_verification_checks_but_a_verifier_can(): void
    {
        $expertUser = ExpertUser::factory()->create();
        $profile = ExpertPoolProfile::create(['expert_user_id' => $expertUser->id]);
        $case = VerificationCase::create(['expert_pool_profile_id' => $profile->id, 'status' => 'pending', 'opened_at' => now()]);
        $check = VerificationCheck::create(['verification_case_id' => $case->id, 'check_type' => 'identity', 'status' => 'pending']);

        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        $recruiterToken = $recruiter->createToken('admin-session')->plainTextToken;

        $this->withToken($recruiterToken)
            ->patchJson("/api/admin/verification-cases/{$case->id}/checks/{$check->id}", ['status' => 'under_review'])
            ->assertStatus(403);

        Auth::forgetGuards();
        $verifier = User::factory()->create(['role' => RsRole::Verifier]);
        $verifierToken = $verifier->createToken('admin-session')->plainTextToken;

        $this->withToken($verifierToken)
            ->patchJson("/api/admin/verification-cases/{$case->id}/checks/{$check->id}", ['status' => 'under_review'])
            ->assertStatus(200);
    }

    /** @test */
    public function super_admin_bypasses_every_permission_check(): void
    {
        $superAdmin = User::factory()->create(['role' => RsRole::SuperAdmin]);
        $token = $superAdmin->createToken('admin-session')->plainTextToken;

        $this->withToken($token)->getJson('/api/admin/recruiter-search')->assertStatus(200);
        $this->withToken($token)->getJson('/api/admin/organisations')->assertStatus(200);
        $this->withToken($token)->getJson('/api/admin/talent-requests')->assertStatus(200);
        $this->withToken($token)->getJson('/api/admin/verification-cases')->assertStatus(200);
    }

    /** @test */
    public function a_talent_request_status_update_requires_the_talent_request_manage_permission(): void
    {
        $organisation = Organisation::factory()->create();
        $talentRequest = TalentRequest::create([
            'organisation_id' => $organisation->id,
            'service_type' => 'talent_hunt',
            'title' => 'Role',
            'description' => 'desc',
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $verifier = User::factory()->create(['role' => RsRole::Verifier]);
        $token = $verifier->createToken('admin-session')->plainTextToken;

        $this->withToken($token)
            ->patchJson("/api/admin/talent-requests/{$talentRequest->id}/status", ['status' => 'under_review'])
            ->assertStatus(403);

        Auth::forgetGuards();
        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        $recruiterToken = $recruiter->createToken('admin-session')->plainTextToken;

        $this->withToken($recruiterToken)
            ->patchJson("/api/admin/talent-requests/{$talentRequest->id}/status", ['status' => 'under_review'])
            ->assertStatus(200);
    }
}
