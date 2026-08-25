<?php

namespace Tests\Feature\Phase3;

use App\Enums\Permission;
use App\Enums\RsRole;
use App\Models\OrganisationUser;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantIsolationAndRbacTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function a_recruiter_holds_verification_case_assessment_and_interview_permissions_but_not_reference_check(): void
    {
        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        $this->assertTrue($recruiter->hasPermission(Permission::VerificationCaseManage));
        $this->assertTrue($recruiter->hasPermission(Permission::AssessmentManage));
        $this->assertTrue($recruiter->hasPermission(Permission::InterviewManage));
        $this->assertFalse($recruiter->hasPermission(Permission::ReferenceCheckManage));
    }

    /** @test */
    public function a_verifier_holds_only_reference_check_management_among_the_new_phase_3_permissions(): void
    {
        $verifier = User::factory()->create(['role' => RsRole::Verifier]);
        $this->assertTrue($verifier->hasPermission(Permission::ReferenceCheckManage));
        $this->assertFalse($verifier->hasPermission(Permission::VerificationCaseManage));
        $this->assertFalse($verifier->hasPermission(Permission::AssessmentManage));
        $this->assertFalse($verifier->hasPermission(Permission::InterviewManage));
    }

    /** @test */
    public function a_recruitment_manager_holds_every_new_phase_3_rs_permission(): void
    {
        $manager = User::factory()->create(['role' => RsRole::RecruitmentManager]);
        $this->assertTrue($manager->hasPermission(Permission::VerificationCaseManage));
        $this->assertTrue($manager->hasPermission(Permission::AssessmentManage));
        $this->assertTrue($manager->hasPermission(Permission::InterviewManage));
        $this->assertTrue($manager->hasPermission(Permission::ReferenceCheckManage));
    }

    /** @test */
    public function super_admin_bypasses_every_new_phase_3_permission_check(): void
    {
        $superAdmin = User::factory()->create(['role' => RsRole::SuperAdmin]);
        $this->assertTrue($superAdmin->hasPermission(Permission::VerificationCaseManage));
        $this->assertTrue($superAdmin->hasPermission(Permission::AssessmentManage));
        $this->assertTrue($superAdmin->hasPermission(Permission::InterviewManage));
        $this->assertTrue($superAdmin->hasPermission(Permission::ReferenceCheckManage));
        $this->assertTrue($superAdmin->hasPermission(Permission::CandidateEvaluationManage));
    }

    /** @test */
    public function an_organisation_representative_holds_candidate_evaluation_management_but_no_rs_staff_permission(): void
    {
        $orgUser = OrganisationUser::factory()->create();
        $this->assertTrue($orgUser->hasPermission(Permission::CandidateEvaluationManage));
        $this->assertFalse($orgUser->hasPermission(Permission::AssessmentManage));
        $this->assertFalse($orgUser->hasPermission(Permission::InterviewManage));
        $this->assertFalse($orgUser->hasPermission(Permission::ReferenceCheckManage));
        $this->assertFalse($orgUser->hasPermission(Permission::VerificationCaseManage));
    }
}
