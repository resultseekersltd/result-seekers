<?php

namespace Tests\Feature\Phase3;

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
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class AssessmentSecurityTest extends TestCase
{
    use RefreshDatabase;

    private function makeEntry(User $recruiter): array
    {
        $organisation = Organisation::factory()->verified()->create();
        $talentRequest = TalentRequest::create([
            'organisation_id' => $organisation->id,
            'service_type' => 'talent_hunt',
            'title' => 'Data Analyst',
            'description' => 'A description of the role and requirements.',
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);
        $assignment = RecruitmentAssignment::create([
            'talent_request_id' => $talentRequest->id,
            'organisation_id' => $organisation->id,
            'recruiter_id' => $recruiter->id,
            'reference' => 'RA-TEST-'.$talentRequest->id,
            'status' => 'opened',
            'opened_at' => now(),
        ]);
        $expertUser = ExpertUser::factory()->create();
        $profile = ExpertPoolProfile::create([
            'expert_user_id' => $expertUser->id,
            'professional_title' => 'Data Analyst',
            'country' => 'Nigeria',
            'visibility_status' => ExpertVisibility::AnonymousMatching,
        ]);
        $entry = CandidatePipelineEntry::create([
            'recruitment_assignment_id' => $assignment->id,
            'expert_pool_profile_id' => $profile->id,
            'stage' => 'shortlisted',
            'added_by' => $recruiter->id,
        ]);

        return [$assignment, $entry, $expertUser];
    }

    /** @test */
    public function a_recruiter_cannot_assign_an_assessment_on_another_recruiters_assignment(): void
    {
        $recruiterA = User::factory()->create(['role' => RsRole::Recruiter]);
        [$assignment, $entry] = $this->makeEntry($recruiterA);

        $recruiterB = User::factory()->create(['role' => RsRole::Recruiter]);
        $tokenB = $recruiterB->createToken('admin-session')->plainTextToken;

        $this->withToken($tokenB)->postJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/assessments",
            ['type' => 'written_response', 'title' => 'Test'],
        )->assertStatus(403);
    }

    /** @test */
    public function a_verifier_cannot_assign_or_score_assessments(): void
    {
        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        [$assignment, $entry] = $this->makeEntry($recruiter);

        $verifier = User::factory()->create(['role' => RsRole::Verifier]);
        $token = $verifier->createToken('admin-session')->plainTextToken;

        $this->withToken($token)->postJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/assessments",
            ['type' => 'written_response', 'title' => 'Test'],
        )->assertStatus(403);
    }

    /** @test */
    public function a_professional_cannot_access_another_professionals_assessment(): void
    {
        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        [$assignment, $entry] = $this->makeEntry($recruiter);
        $token = $recruiter->createToken('admin-session')->plainTextToken;

        $assessmentRes = $this->withToken($token)->postJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/assessments",
            ['type' => 'written_response', 'title' => 'Test'],
        );
        $assessmentId = $assessmentRes->json('data.id');

        Auth::forgetGuards();
        $otherExpert = ExpertUser::factory()->create();
        $otherToken = $otherExpert->createToken('expert-session')->plainTextToken;

        $this->withToken($otherToken)->getJson("/api/expert-pool/assessments/{$assessmentId}")->assertStatus(404);
        $this->withToken($otherToken)->postJson("/api/expert-pool/assessments/{$assessmentId}/submit", [
            'response_text' => 'trying to answer someone elses assessment',
        ])->assertStatus(404);
    }

    /** @test */
    public function a_candidate_cannot_submit_beyond_the_attempt_limit(): void
    {
        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        [$assignment, $entry, $expertUser] = $this->makeEntry($recruiter);
        $token = $recruiter->createToken('admin-session')->plainTextToken;

        $assessmentRes = $this->withToken($token)->postJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/assessments",
            ['type' => 'written_response', 'title' => 'Test', 'attempt_limit' => 1],
        );
        $assessmentId = $assessmentRes->json('data.id');

        Auth::forgetGuards();
        $expertToken = $expertUser->createToken('expert-session')->plainTextToken;

        $this->withToken($expertToken)->postJson("/api/expert-pool/assessments/{$assessmentId}/submit", [
            'response_text' => 'first attempt',
        ])->assertStatus(200);

        $this->withToken($expertToken)->postJson("/api/expert-pool/assessments/{$assessmentId}/submit", [
            'response_text' => 'second attempt should be rejected',
        ])->assertStatus(422);
    }

    /** @test */
    public function the_result_is_hidden_from_the_candidate_until_marked_visible(): void
    {
        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        [$assignment, $entry, $expertUser] = $this->makeEntry($recruiter);
        $token = $recruiter->createToken('admin-session')->plainTextToken;

        $assessmentRes = $this->withToken($token)->postJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/assessments",
            ['type' => 'written_response', 'title' => 'Test', 'result_visible_to_candidate' => false],
        );
        $assessmentId = $assessmentRes->json('data.id');

        Auth::forgetGuards();
        $expertToken = $expertUser->createToken('expert-session')->plainTextToken;
        $submitRes = $this->withToken($expertToken)->postJson("/api/expert-pool/assessments/{$assessmentId}/submit", [
            'response_text' => 'my answer',
        ]);
        $submissionId = $submitRes->json('data.my_submission.id');

        Auth::forgetGuards();
        $this->withToken($token)->postJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/assessments/{$assessmentId}/submissions/{$submissionId}/score",
            ['score' => 90, 'max_score' => 100],
        )->assertStatus(200);

        Auth::forgetGuards();
        $showRes = $this->withToken($expertToken)->getJson("/api/expert-pool/assessments/{$assessmentId}");
        $showRes->assertStatus(200);
        $this->assertNull($showRes->json('data.result'));
    }

    /** @test */
    public function an_organisation_can_never_reach_any_assessment_endpoint(): void
    {
        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        [$assignment, $entry] = $this->makeEntry($recruiter);

        $orgUser = OrganisationUser::factory()->create();
        $token = $orgUser->createToken('organisation-session')->plainTextToken;

        $this->withToken($token)->getJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/assessments",
        )->assertStatus(403);
    }
}
