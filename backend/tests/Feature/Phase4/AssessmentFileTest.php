<?php

namespace Tests\Feature\Phase4;

use App\Enums\ExpertVisibility;
use App\Enums\RsRole;
use App\Models\AssessmentSubmission;
use App\Models\CandidatePipelineEntry;
use App\Models\ExpertPoolProfile;
use App\Models\ExpertUser;
use App\Models\Organisation;
use App\Models\OrganisationUser;
use App\Models\RecruitmentAssignment;
use App\Models\TalentRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AssessmentFileTest extends TestCase
{
    use RefreshDatabase;

    /** @return array{0: RecruitmentAssignment, 1: CandidatePipelineEntry, 2: User, 3: ExpertUser} */
    private function makeAssessmentEntry(): array
    {
        Storage::fake('local');

        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
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

        return [$assignment, $entry, $recruiter, $expertUser];
    }

    /** @test */
    public function the_owning_candidate_can_upload_a_file_with_their_submission(): void
    {
        [$assignment, $entry, $recruiter, $expertUser] = $this->makeAssessmentEntry();
        $token = $recruiter->createToken('admin-session')->plainTextToken;

        $assessmentRes = $this->withToken($token)->postJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/assessments",
            ['type' => 'file_submission', 'title' => 'Take-home Test'],
        );
        $assessmentId = $assessmentRes->json('data.id');

        Auth::forgetGuards();
        $expertToken = $expertUser->createToken('expert-session')->plainTextToken;

        $file = UploadedFile::fake()->create('answer.pdf', 100, 'application/pdf');
        $submitRes = $this->withToken($expertToken)->post("/api/expert-pool/assessments/{$assessmentId}/submit", [
            'file' => $file,
        ], ['Accept' => 'application/json']);

        $submitRes->assertStatus(200)->assertJsonPath('data.my_submission.has_file', true);

        // The stored path is never the original filename — it's randomised.
        $stored = AssessmentSubmission::first();
        $this->assertNotNull($stored->file_path);
        $this->assertStringNotContainsString('answer.pdf', $stored->file_path);
        $this->assertSame('answer.pdf', $stored->file_original_name);
        Storage::disk('local')->assertExists($stored->file_path);
    }

    /** @test */
    public function an_unauthorized_professional_cannot_upload_to_another_candidates_assessment(): void
    {
        [$assignment, $entry, $recruiter] = $this->makeAssessmentEntry();
        $token = $recruiter->createToken('admin-session')->plainTextToken;

        $assessmentRes = $this->withToken($token)->postJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/assessments",
            ['type' => 'file_submission', 'title' => 'Take-home Test'],
        );
        $assessmentId = $assessmentRes->json('data.id');

        Auth::forgetGuards();
        $unrelatedExpert = ExpertUser::factory()->create();
        $unrelatedToken = $unrelatedExpert->createToken('expert-session')->plainTextToken;

        $file = UploadedFile::fake()->create('answer.pdf', 100, 'application/pdf');
        $this->withToken($unrelatedToken)->post("/api/expert-pool/assessments/{$assessmentId}/submit", [
            'file' => $file,
        ], ['Accept' => 'application/json'])->assertStatus(404);
    }

    /** @test */
    public function the_owning_candidate_can_download_their_own_file_but_an_unrelated_professional_cannot(): void
    {
        [$assignment, $entry, $recruiter, $expertUser] = $this->makeAssessmentEntry();
        $token = $recruiter->createToken('admin-session')->plainTextToken;

        $assessmentRes = $this->withToken($token)->postJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/assessments",
            ['type' => 'file_submission', 'title' => 'Take-home Test'],
        );
        $assessmentId = $assessmentRes->json('data.id');

        Auth::forgetGuards();
        $expertToken = $expertUser->createToken('expert-session')->plainTextToken;
        $file = UploadedFile::fake()->create('answer.pdf', 100, 'application/pdf');
        $submitRes = $this->withToken($expertToken)->post("/api/expert-pool/assessments/{$assessmentId}/submit", [
            'file' => $file,
        ], ['Accept' => 'application/json']);
        $submissionId = $submitRes->json('data.my_submission.id');

        $this->withToken($expertToken)->get("/api/expert-pool/assessments/{$assessmentId}/submissions/{$submissionId}/file")
            ->assertStatus(200);

        Auth::forgetGuards();
        $unrelatedExpert = ExpertUser::factory()->create();
        $unrelatedToken = $unrelatedExpert->createToken('expert-session')->plainTextToken;
        $this->withToken($unrelatedToken)->get("/api/expert-pool/assessments/{$assessmentId}/submissions/{$submissionId}/file")
            ->assertStatus(404);
    }

    /** @test */
    public function the_owning_recruiter_can_download_the_file_but_an_organisation_cannot_reach_the_endpoint_at_all(): void
    {
        [$assignment, $entry, $recruiter, $expertUser] = $this->makeAssessmentEntry();
        $token = $recruiter->createToken('admin-session')->plainTextToken;

        $assessmentRes = $this->withToken($token)->postJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/assessments",
            ['type' => 'file_submission', 'title' => 'Take-home Test'],
        );
        $assessmentId = $assessmentRes->json('data.id');

        Auth::forgetGuards();
        $expertToken = $expertUser->createToken('expert-session')->plainTextToken;
        $file = UploadedFile::fake()->create('answer.pdf', 100, 'application/pdf');
        $submitRes = $this->withToken($expertToken)->post("/api/expert-pool/assessments/{$assessmentId}/submit", [
            'file' => $file,
        ], ['Accept' => 'application/json']);
        $submissionId = $submitRes->json('data.my_submission.id');

        Auth::forgetGuards();
        $this->withToken($token)->get(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/assessments/{$assessmentId}/submissions/{$submissionId}/file",
        )->assertStatus(200);

        Auth::forgetGuards();
        $orgUser = OrganisationUser::factory()->create();
        $orgToken = $orgUser->createToken('organisation-session')->plainTextToken;
        $this->withToken($orgToken)->get(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/assessments/{$assessmentId}/submissions/{$submissionId}/file",
        )->assertStatus(403);
    }
}
