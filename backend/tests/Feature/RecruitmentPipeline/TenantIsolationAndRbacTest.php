<?php

namespace Tests\Feature\RecruitmentPipeline;

use App\Enums\CandidateConsentStatus;
use App\Enums\ExpertVisibility;
use App\Enums\Permission;
use App\Enums\RsRole;
use App\Models\CandidateConsent;
use App\Models\DataRelease;
use App\Models\ExpertPoolProfile;
use App\Models\ExpertUser;
use App\Models\Organisation;
use App\Models\OrganisationCandidateComment;
use App\Models\OrganisationUser;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * expert-network.txt "MULTI-TENANT ISOLATION" applied to the Phase 2
 * entities that did not exist when Phase 1's TenantIsolationTest was
 * written — released candidates and organisation comments — plus a
 * Phase-2-specific RBAC sweep of the new permissions.
 */
class TenantIsolationAndRbacTest extends TestCase
{
    use RefreshDatabase;

    private function releaseFor(Organisation $organisation): DataRelease
    {
        $expertUser = ExpertUser::factory()->create();
        $profile = ExpertPoolProfile::create([
            'expert_user_id' => $expertUser->id,
            'professional_title' => 'Senior MEAL Specialist',
            'country' => 'Nigeria',
            'years_experience' => 10,
            'visibility_status' => ExpertVisibility::AnonymousMatching,
        ]);
        $consent = CandidateConsent::create([
            'expert_pool_profile_id' => $profile->id,
            'organisation_id' => $organisation->id,
            'status' => CandidateConsentStatus::Consented,
            'purpose' => 'test',
            'consent_text_version' => 'v1',
            'requested_at' => now(),
            'consented_at' => now(),
        ]);

        $releaser = User::factory()->create(['role' => RsRole::RecruitmentManager]);

        return DataRelease::create([
            'candidate_consent_id' => $consent->id,
            'released_to_organisation_id' => $organisation->id,
            'released_by' => $releaser->id,
            'released_fields' => ['candidate_reference' => 'CAND-TEST-1', 'professional_title' => 'Senior MEAL Specialist'],
            'purpose' => 'test',
            'released_at' => now(),
        ]);
    }

    /** @test */
    public function organisation_a_cannot_comment_on_organisation_bs_released_candidate(): void
    {
        $organisationA = Organisation::factory()->verified()->create();
        $organisationB = Organisation::factory()->verified()->create();
        $releaseB = $this->releaseFor($organisationB);

        $orgUserA = OrganisationUser::factory()->create(['organisation_id' => $organisationA->id]);
        $tokenA = $orgUserA->createToken('organisation-session')->plainTextToken;

        $this->withToken($tokenA)
            ->postJson("/api/organisation/released-candidates/{$releaseB->id}/comments", ['comment' => 'Trying to comment cross-tenant.'])
            ->assertStatus(403);

        $this->assertSame(0, OrganisationCandidateComment::count());
    }

    /** @test */
    public function organisation_a_cannot_update_the_status_of_organisation_bs_released_candidate(): void
    {
        $organisationA = Organisation::factory()->verified()->create();
        $organisationB = Organisation::factory()->verified()->create();
        $releaseB = $this->releaseFor($organisationB);

        $orgUserA = OrganisationUser::factory()->create(['organisation_id' => $organisationA->id]);
        $tokenA = $orgUserA->createToken('organisation-session')->plainTextToken;

        $this->withToken($tokenA)
            ->patchJson("/api/organisation/released-candidates/{$releaseB->id}/status", ['organisation_status' => 'interested'])
            ->assertStatus(403);

        $this->assertNull($releaseB->fresh()->organisation_status);
    }

    /** @test */
    public function organisation_as_released_candidates_index_never_includes_organisation_bs_releases(): void
    {
        $organisationA = Organisation::factory()->verified()->create();
        $organisationB = Organisation::factory()->verified()->create();
        $this->releaseFor($organisationA);
        $this->releaseFor($organisationB);
        $this->releaseFor($organisationB);

        $orgUserA = OrganisationUser::factory()->create(['organisation_id' => $organisationA->id]);
        $tokenA = $orgUserA->createToken('organisation-session')->plainTextToken;

        $this->withToken($tokenA)->getJson('/api/organisation/released-candidates')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    /** @test */
    public function an_organisation_cannot_manipulate_ids_to_reach_another_organisations_release(): void
    {
        $organisationA = Organisation::factory()->verified()->create();
        $organisationB = Organisation::factory()->verified()->create();
        $releaseA = $this->releaseFor($organisationA);
        $releaseB = $this->releaseFor($organisationB);

        $orgUserA = OrganisationUser::factory()->create(['organisation_id' => $organisationA->id]);
        $tokenA = $orgUserA->createToken('organisation-session')->plainTextToken;

        $this->withToken($tokenA)->getJson("/api/organisation/released-candidates/{$releaseA->id}")->assertStatus(200);
        $this->withToken($tokenA)->getJson("/api/organisation/released-candidates/{$releaseB->id}")->assertStatus(403);
    }

    /** @test */
    public function a_verifier_has_no_recruitment_pipeline_permissions(): void
    {
        $verifier = User::factory()->create(['role' => RsRole::Verifier]);
        $this->assertFalse($verifier->hasPermission(Permission::CandidatePipelineManage));
        $this->assertFalse($verifier->hasPermission(Permission::QualityReviewPerform));
        $this->assertFalse($verifier->hasPermission(Permission::CandidateReleaseApprove));
        $this->assertFalse($verifier->hasPermission(Permission::RecruitmentAssignmentManage));
    }

    /** @test */
    public function a_recruiter_has_pipeline_and_assignment_permissions_but_not_quality_review_or_release(): void
    {
        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        $this->assertTrue($recruiter->hasPermission(Permission::CandidatePipelineManage));
        $this->assertTrue($recruiter->hasPermission(Permission::RecruitmentAssignmentManage));
        $this->assertFalse($recruiter->hasPermission(Permission::QualityReviewPerform));
        $this->assertFalse($recruiter->hasPermission(Permission::CandidateReleaseApprove));
    }

    /** @test */
    public function a_recruitment_manager_holds_every_phase_2_governance_permission(): void
    {
        $manager = User::factory()->create(['role' => RsRole::RecruitmentManager]);
        $this->assertTrue($manager->hasPermission(Permission::CandidatePipelineManage));
        $this->assertTrue($manager->hasPermission(Permission::RecruitmentAssignmentManage));
        $this->assertTrue($manager->hasPermission(Permission::QualityReviewPerform));
        $this->assertTrue($manager->hasPermission(Permission::CandidateReleaseApprove));
    }

    /** @test */
    public function super_admin_bypasses_every_phase_2_permission_check(): void
    {
        $superAdmin = User::factory()->create(['role' => RsRole::SuperAdmin]);
        $this->assertTrue($superAdmin->hasPermission(Permission::CandidatePipelineManage));
        $this->assertTrue($superAdmin->hasPermission(Permission::QualityReviewPerform));
        $this->assertTrue($superAdmin->hasPermission(Permission::CandidateReleaseApprove));
    }

    /** @test */
    public function an_organisation_representative_can_view_released_candidates_but_holds_no_rs_staff_permissions(): void
    {
        $orgUser = OrganisationUser::factory()->create();
        $this->assertTrue($orgUser->hasPermission(Permission::ReleasedCandidateView));
    }
}
