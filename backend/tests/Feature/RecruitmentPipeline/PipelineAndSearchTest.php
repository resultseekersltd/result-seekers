<?php

namespace Tests\Feature\RecruitmentPipeline;

use App\Enums\CandidatePipelineStage;
use App\Enums\ExpertVisibility;
use App\Enums\RsRole;
use App\Models\CandidatePipelineEntry;
use App\Models\ExpertPoolProfile;
use App\Models\ExpertUser;
use App\Models\Organisation;
use App\Models\OrganisationUser;
use App\Models\RecruitmentAssignment;
use App\Models\TalentRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PipelineAndSearchTest extends TestCase
{
    use RefreshDatabase;

    private function makeAssignment(User $recruiter): RecruitmentAssignment
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

        return RecruitmentAssignment::create([
            'talent_request_id' => $talentRequest->id,
            'organisation_id' => $organisation->id,
            'recruiter_id' => $recruiter->id,
            'reference' => 'RA-TEST-'.$talentRequest->id,
            'status' => 'opened',
            'opened_at' => now(),
        ]);
    }

    private function makeProfile(): ExpertPoolProfile
    {
        $expertUser = ExpertUser::factory()->create();

        return ExpertPoolProfile::create([
            'expert_user_id' => $expertUser->id,
            'professional_title' => 'Senior MEAL Specialist',
            'country' => 'Nigeria',
            'years_experience' => 10,
            'visibility_status' => ExpertVisibility::AnonymousMatching,
        ]);
    }

    /** @test */
    public function a_recruiter_owns_their_assignments_pipeline_and_can_manage_entries(): void
    {
        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        $token = $recruiter->createToken('admin-session')->plainTextToken;
        $assignment = $this->makeAssignment($recruiter);
        $profile = $this->makeProfile();

        $this->withToken($token)
            ->postJson("/api/admin/recruitment-assignments/{$assignment->id}/pipeline", ['expert_pool_profile_id' => $profile->id])
            ->assertStatus(201);
    }

    /** @test */
    public function a_recruiter_cannot_manage_another_recruiters_assignment_pipeline(): void
    {
        $recruiterA = User::factory()->create(['role' => RsRole::Recruiter]);
        $recruiterB = User::factory()->create(['role' => RsRole::Recruiter]);
        $assignment = $this->makeAssignment($recruiterA);
        $profile = $this->makeProfile();

        $tokenB = $recruiterB->createToken('admin-session')->plainTextToken;

        $this->withToken($tokenB)
            ->postJson("/api/admin/recruitment-assignments/{$assignment->id}/pipeline", ['expert_pool_profile_id' => $profile->id])
            ->assertStatus(403);
    }

    /** @test */
    public function a_recruitment_manager_can_participate_in_any_recruiters_assignment(): void
    {
        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        $manager = User::factory()->create(['role' => RsRole::RecruitmentManager]);
        $assignment = $this->makeAssignment($recruiter);
        $profile = $this->makeProfile();

        $managerToken = $manager->createToken('admin-session')->plainTextToken;

        $this->withToken($managerToken)
            ->getJson("/api/admin/recruitment-assignments/{$assignment->id}/pipeline")
            ->assertStatus(200);
    }

    /** @test */
    public function a_professional_can_belong_to_multiple_assignments_pipelines_independently(): void
    {
        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        $assignmentOne = $this->makeAssignment($recruiter);
        $assignmentTwo = $this->makeAssignment($recruiter);
        $profile = $this->makeProfile();

        CandidatePipelineEntry::create([
            'recruitment_assignment_id' => $assignmentOne->id,
            'expert_pool_profile_id' => $profile->id,
            'stage' => CandidatePipelineStage::Longlisted,
            'added_by' => $recruiter->id,
        ]);
        CandidatePipelineEntry::create([
            'recruitment_assignment_id' => $assignmentTwo->id,
            'expert_pool_profile_id' => $profile->id,
            'stage' => CandidatePipelineStage::Identified,
            'added_by' => $recruiter->id,
        ]);

        $this->assertSame(2, CandidatePipelineEntry::where('expert_pool_profile_id', $profile->id)->count());
    }

    /** @test */
    public function an_organisation_cannot_access_the_internal_pipeline_at_all(): void
    {
        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        $assignment = $this->makeAssignment($recruiter);
        $orgUser = OrganisationUser::factory()->create(['organisation_id' => $assignment->organisation_id]);
        $orgToken = $orgUser->createToken('organisation-session')->plainTextToken;

        $this->withToken($orgToken)
            ->getJson("/api/admin/recruitment-assignments/{$assignment->id}/pipeline")
            ->assertStatus(403);
    }

    /** @test */
    public function a_recruiter_can_search_the_professional_database(): void
    {
        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        $token = $recruiter->createToken('admin-session')->plainTextToken;
        $this->makeProfile();

        $this->withToken($token)->getJson('/api/admin/recruiter-search')->assertStatus(200);
    }

    /** @test */
    public function an_organisation_cannot_search_the_professional_database(): void
    {
        $organisation = Organisation::factory()->verified()->create();
        $orgUser = OrganisationUser::factory()->create(['organisation_id' => $organisation->id]);
        $orgToken = $orgUser->createToken('organisation-session')->plainTextToken;

        $this->withToken($orgToken)->getJson('/api/admin/recruiter-search')->assertStatus(403);
    }

    /** @test */
    public function a_professional_cannot_search_other_professionals(): void
    {
        $expertUser = ExpertUser::factory()->create();
        $expertToken = $expertUser->createToken('expert-session')->plainTextToken;

        $this->withToken($expertToken)->getJson('/api/admin/recruiter-search')->assertStatus(403);
    }

    /** @test */
    public function recruiter_search_results_never_include_private_contact_data(): void
    {
        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        $token = $recruiter->createToken('admin-session')->plainTextToken;
        $this->makeProfile();

        $response = $this->withToken($token)->getJson('/api/admin/recruiter-search')->assertStatus(200);
        $body = $response->json();

        $this->assertStringNotContainsStringIgnoringCase('email', json_encode($body['data'][0] ?? []));
    }
}
