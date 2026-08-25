<?php

namespace Tests\Feature\Phase3;

use App\Enums\CandidateConsentStatus;
use App\Enums\ExpertVisibility;
use App\Enums\RsRole;
use App\Models\CandidateConsent;
use App\Models\CandidatePipelineEntry;
use App\Models\DataRelease;
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

/**
 * Walks Verification -> Assessment -> Interview -> Reference Check ->
 * Organisation Evaluation end-to-end on top of an already-released
 * candidate (reusing the exact Phase 2 release mechanics), asserting
 * real state at each step through real HTTP calls.
 */
class EndToEndEvaluationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function the_complete_phase_3_evaluation_workflow_works_end_to_end(): void
    {
        // --- Setup: organisation, recruiter, manager, verifier, released candidate ---
        $organisation = Organisation::factory()->verified()->create();
        $orgUser = OrganisationUser::factory()->create(['organisation_id' => $organisation->id]);
        $orgToken = $orgUser->createToken('organisation-session')->plainTextToken;

        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        $recruiterToken = $recruiter->createToken('admin-session')->plainTextToken;

        $manager = User::factory()->create(['role' => RsRole::RecruitmentManager]);
        $managerToken = $manager->createToken('admin-session')->plainTextToken;

        $verifier = User::factory()->create(['role' => RsRole::Verifier]);
        $verifierToken = $verifier->createToken('admin-session')->plainTextToken;

        $expertUser = ExpertUser::factory()->create();
        $profile = ExpertPoolProfile::create([
            'expert_user_id' => $expertUser->id,
            'professional_title' => 'Senior MEAL Specialist',
            'country' => 'Nigeria',
            'years_experience' => 10,
            'visibility_status' => ExpertVisibility::AnonymousMatching,
        ]);
        $expertToken = $expertUser->createToken('expert-session')->plainTextToken;

        $talentRequest = TalentRequest::create([
            'organisation_id' => $organisation->id,
            'service_type' => 'talent_hunt',
            'title' => 'Senior MEAL Specialist',
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
        $entry = CandidatePipelineEntry::create([
            'recruitment_assignment_id' => $assignment->id,
            'expert_pool_profile_id' => $profile->id,
            'stage' => 'shortlisted',
            'added_by' => $recruiter->id,
        ]);
        $consent = CandidateConsent::create([
            'expert_pool_profile_id' => $profile->id,
            'organisation_id' => $organisation->id,
            'candidate_pipeline_entry_id' => $entry->id,
            'status' => CandidateConsentStatus::Consented,
            'purpose' => 'test',
            'consent_text_version' => 'v1',
            'requested_at' => now(),
            'consented_at' => now(),
        ]);
        $release = DataRelease::create([
            'candidate_consent_id' => $consent->id,
            'released_to_organisation_id' => $organisation->id,
            'released_by' => $manager->id,
            'released_fields' => ['candidate_reference' => 'CAND-TEST-1', 'professional_title' => 'Senior MEAL Specialist'],
            'purpose' => 'test',
            'released_at' => now(),
        ]);

        // --- 1. Verification: recruiter opens a case tied to this entry, verifier reviews and approves a check ---
        $caseRes = $this->withToken($recruiterToken)->postJson('/api/admin/verification-cases', [
            'expert_pool_profile_id' => $profile->id,
            'candidate_pipeline_entry_id' => $entry->id,
            'target_level' => 'identity_verified',
        ]);
        $caseRes->assertStatus(201);
        $caseId = $caseRes->json('data.id');

        Auth::forgetGuards();
        $checkRes = $this->withToken($recruiterToken)->postJson("/api/admin/verification-cases/{$caseId}/checks", [
            'check_type' => 'identity',
            'subject' => 'National ID',
        ]);
        $checkRes->assertStatus(201);
        $checkId = collect($checkRes->json('data.checks'))->firstWhere('check_type', 'identity')['id'];

        Auth::forgetGuards();
        $this->withToken($verifierToken)
            ->patchJson("/api/admin/verification-cases/{$caseId}/checks/{$checkId}", ['status' => 'verified'])
            ->assertStatus(200)
            ->assertJsonPath('data.checks.0.status', 'verified');

        // --- 2. Assessment: recruiter assigns, candidate submits, recruiter scores ---
        Auth::forgetGuards();
        $assessmentRes = $this->withToken($recruiterToken)
            ->postJson("/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/assessments", [
                'type' => 'written_response',
                'title' => 'MEAL Framework Assessment',
                'instructions' => 'Describe your approach.',
            ]);
        $assessmentRes->assertStatus(201);
        $assessmentId = $assessmentRes->json('data.id');

        Auth::forgetGuards();
        $listRes = $this->withToken($expertToken)->getJson('/api/expert-pool/assessments');
        $listRes->assertStatus(200)->assertJsonCount(1, 'data');

        $submitRes = $this->withToken($expertToken)->postJson("/api/expert-pool/assessments/{$assessmentId}/submit", [
            'response_text' => 'My structured approach to MEAL frameworks...',
        ]);
        $submitRes->assertStatus(200);
        $submissionId = $submitRes->json('data.my_submission.id');

        // The candidate must never see reviewer identity or criteria breakdown.
        $this->assertArrayNotHasKey('reviewer', $submitRes->json('data'));

        Auth::forgetGuards();
        $scoreRes = $this->withToken($recruiterToken)->postJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/assessments/{$assessmentId}/submissions/{$submissionId}/score",
            ['score' => 85, 'max_score' => 100, 'review_notes' => 'Strong technical grasp.'],
        );
        $scoreRes->assertStatus(200)->assertJsonPath('data.status', 'reviewed');

        // --- 3. Interview: recruiter schedules, adds an RS panelist and an org panelist ---
        Auth::forgetGuards();
        $interviewRes = $this->withToken($recruiterToken)
            ->postJson("/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/interviews", [
                'type' => 'video',
                'scheduled_at' => now()->addDays(3)->toIso8601String(),
                'timezone' => 'Africa/Lagos',
                'location_or_link' => 'https://meet.example.com/abc',
            ]);
        $interviewRes->assertStatus(201);
        $interviewId = $interviewRes->json('data.id');

        $this->withToken($recruiterToken)->postJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/interviews/{$interviewId}/panel-members",
            ['panelist_type' => 'user', 'panelist_id' => $recruiter->id, 'role' => 'chair'],
        )->assertStatus(201);

        $this->withToken($recruiterToken)->postJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/interviews/{$interviewId}/panel-members",
            ['panelist_type' => 'organisation_user', 'panelist_id' => $orgUser->id, 'role' => 'client_representative'],
        )->assertStatus(201);

        // Candidate sees only public interview logistics, never panel/scorecard data.
        Auth::forgetGuards();
        $candidateInterviewRes = $this->withToken($expertToken)->getJson('/api/expert-pool/interviews');
        $candidateInterviewRes->assertStatus(200)->assertJsonCount(1, 'data');
        $this->assertArrayNotHasKey('panel_members', $candidateInterviewRes->json('data.0'));
        $this->assertArrayNotHasKey('scorecards', $candidateInterviewRes->json('data.0'));

        $this->withToken($expertToken)->postJson("/api/expert-pool/interviews/{$interviewId}/confirm")->assertStatus(200);

        // RS panelist submits their scorecard.
        Auth::forgetGuards();
        $this->withToken($recruiterToken)->postJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/interviews/{$interviewId}/scorecard",
            ['overall_recommendation' => 'yes', 'panel_comments' => 'Solid candidate.'],
        )->assertStatus(201);

        // Organisation panelist submits their own scorecard through the organisation-side endpoint.
        Auth::forgetGuards();
        $this->withToken($orgToken)->postJson(
            "/api/organisation/interviews/{$interviewId}/scorecard",
            ['overall_recommendation' => 'strong_yes', 'panel_comments' => 'Excellent fit.'],
        )->assertStatus(201);

        // Blind scoring: before the interview is completed, the org panelist's own view shows only their own scorecard.
        Auth::forgetGuards();
        $orgInterviewShow = $this->withToken($orgToken)->getJson("/api/organisation/interviews/{$interviewId}");
        $orgInterviewShow->assertStatus(200);
        $this->assertNotNull($orgInterviewShow->json('data.my_scorecard'));
        $this->assertArrayNotHasKey('scorecards', $orgInterviewShow->json('data')); // org resource never exposes a raw scorecards list at all

        // RS admin view: while not completed, the manager (oversight tier) still sees both scorecards; mark completed to open visibility generally.
        Auth::forgetGuards();
        $this->withToken($managerToken)->patchJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/interviews/{$interviewId}/status",
            ['status' => 'completed'],
        )->assertStatus(200)->assertJsonPath('data.status', 'completed');

        // --- 4. Reference check: verifier requests with candidate consent, records outcome ---
        Auth::forgetGuards();
        $refRes = $this->withToken($verifierToken)->postJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/reference-checks",
            [
                'referee_name' => 'Dr. Jane Referee',
                'referee_relationship' => 'Former Supervisor',
                'contact_method' => 'email',
                'referee_contact' => 'jane.referee@example.com',
                'candidate_consented' => true,
                'consent_text_version' => 'v1',
            ],
        );
        $refRes->assertStatus(201);
        $refCheckId = $refRes->json('data.id');
        // Referee contact is only ever visible on the RS-internal resource.
        $this->assertSame('jane.referee@example.com', $refRes->json('data.referee_contact'));

        $this->withToken($verifierToken)->patchJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/reference-checks/{$refCheckId}",
            ['status' => 'completed', 'final_outcome' => 'positive', 'verification_notes' => 'Confirmed strong performance.'],
        )->assertStatus(200)->assertJsonPath('data.final_outcome', 'positive');

        // --- 5. Organisation evaluation: structured score on the released candidate ---
        Auth::forgetGuards();
        $evalRes = $this->withToken($orgToken)->postJson("/api/organisation/released-candidates/{$release->id}/evaluations", [
            'score' => 92,
            'criteria_notes' => 'Excellent communication and technical depth.',
            'recommendation' => 'Proceed to offer.',
            'final_outcome' => 'selected',
        ]);
        $evalRes->assertStatus(201)->assertJsonPath('data.final_outcome', 'selected');

        // The organisation's evaluation view never leaks referee contact, verification notes, or reviewer identity from the RS side.
        $orgEvalBody = json_encode($evalRes->json());
        $this->assertStringNotContainsString('jane.referee@example.com', $orgEvalBody);
        $this->assertStringNotContainsString('Confirmed strong performance', $orgEvalBody);
    }
}
