<?php

namespace Tests\Feature\RecruitmentPipeline;

use App\Enums\ExpertVisibility;
use App\Enums\RsRole;
use App\Models\CandidateConsent;
use App\Models\ExpertPoolProfile;
use App\Models\ExpertUser;
use App\Models\Organisation;
use App\Models\OrganisationUser;
use App\Models\TalentRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

/**
 * Walks the complete Section 32 flow end-to-end through real HTTP calls —
 * Organisation Request → Recruiter → Search/Screening → Internal Longlist
 * → RS Quality Review → Shortlist → Invitation → Interest → Consent →
 * Controlled Release → Secure Organisation Review — asserting the actual
 * state at every step, not just the final outcome.
 */
class EndToEndPipelineTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function the_complete_managed_recruitment_pipeline_works_end_to_end(): void
    {
        // --- Setup: organisation, recruiter, recruitment manager, discoverable expert ---
        $organisation = Organisation::factory()->verified()->create();
        $orgUser = OrganisationUser::factory()->create(['organisation_id' => $organisation->id]);
        $orgToken = $orgUser->createToken('organisation-session')->plainTextToken;

        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        $recruiterToken = $recruiter->createToken('admin-session')->plainTextToken;

        $manager = User::factory()->create(['role' => RsRole::RecruitmentManager]);
        $managerToken = $manager->createToken('admin-session')->plainTextToken;

        $expertUser = ExpertUser::factory()->create();
        $profile = ExpertPoolProfile::create([
            'expert_user_id' => $expertUser->id,
            'professional_title' => 'Senior MEAL Specialist',
            'country' => 'Nigeria',
            'years_experience' => 10,
            'visibility_status' => ExpertVisibility::AnonymousMatching,
        ]);
        $expertToken = $expertUser->createToken('expert-session')->plainTextToken;

        // --- 1. Organisation submits a Talent Request ---
        $this->withToken($orgToken)->postJson('/api/organisation/talent-requests', [
            'service_type' => 'talent_hunt',
            'title' => 'Senior MEAL Specialist',
            'description' => 'Need an experienced MEAL specialist for a 12-month assignment.',
        ])->assertStatus(201);
        $talentRequest = TalentRequest::firstOrFail();
        $this->assertSame('submitted', $talentRequest->status->value);

        // --- 2. Recruiter opens a Recruitment Assignment against the request ---
        Auth::forgetGuards();
        $assignmentRes = $this->withToken($recruiterToken)->postJson('/api/admin/recruitment-assignments', [
            'talent_request_id' => $talentRequest->id,
        ]);
        $assignmentRes->assertStatus(201);
        $assignmentId = $assignmentRes->json('data.id');
        $this->assertSame('in_recruitment', $talentRequest->fresh()->status->value);

        // --- 3. Recruiter searches and adds the candidate to the pipeline ---
        $searchRes = $this->withToken($recruiterToken)->getJson('/api/admin/recruiter-search');
        $searchRes->assertStatus(200)->assertJsonCount(1, 'data');

        $entryRes = $this->withToken($recruiterToken)->postJson("/api/admin/recruitment-assignments/{$assignmentId}/pipeline", [
            'expert_pool_profile_id' => $profile->id,
        ]);
        $entryRes->assertStatus(201)->assertJsonPath('data.stage', 'identified');
        $entryId = $entryRes->json('data.id');

        // --- 4. Screening — eligible, advances to longlisted ---
        $this->withToken($recruiterToken)
            ->postJson("/api/admin/recruitment-assignments/{$assignmentId}/pipeline/{$entryId}/screen", ['decision' => 'eligible'])
            ->assertStatus(200)
            ->assertJsonPath('data.stage', 'longlisted');

        // --- 5. Organisation cannot see the internal longlist at all ---
        Auth::forgetGuards();
        $this->withToken($orgToken)->getJson('/api/organisation/released-candidates')->assertJsonCount(0, 'data');

        // --- 6. RS Quality Review (Recruitment Manager only) approves — produces the shortlist ---
        Auth::forgetGuards();
        $this->withToken($managerToken)
            ->postJson("/api/admin/recruitment-assignments/{$assignmentId}/pipeline/{$entryId}/quality-review", ['decision' => 'approved'])
            ->assertStatus(200)
            ->assertJsonPath('data.stage', 'shortlisted');

        // --- 7. Recruiter sends the opportunity invitation ---
        Auth::forgetGuards();
        $this->withToken($recruiterToken)
            ->postJson("/api/admin/recruitment-assignments/{$assignmentId}/pipeline/{$entryId}/invite")
            ->assertStatus(201);

        // --- 8. Professional accepts the invitation ---
        Auth::forgetGuards();
        $oppRes = $this->withToken($expertToken)->getJson('/api/expert-pool/opportunities');
        $oppRes->assertStatus(200)->assertJsonCount(1, 'data');
        $invitationId = $oppRes->json('data.0.id');

        $this->withToken($expertToken)
            ->postJson("/api/expert-pool/opportunities/{$invitationId}/respond", ['response' => 'accept'])
            ->assertStatus(200);

        // --- 9. Recruiter requests consent ---
        Auth::forgetGuards();
        $consentReqRes = $this->withToken($recruiterToken)
            ->postJson("/api/admin/recruitment-assignments/{$assignmentId}/pipeline/{$entryId}/request-consent");
        $consentReqRes->assertStatus(201);
        $consentId = $consentReqRes->json('data.consent_id');

        // --- 10. Professional grants consent ---
        Auth::forgetGuards();
        $this->withToken($expertToken)
            ->postJson("/api/expert-pool/consents/{$consentId}/respond", ['response' => 'grant'])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'consented');

        // --- 11. Recruitment Manager approves controlled release ---
        Auth::forgetGuards();
        $releaseRes = $this->withToken($managerToken)->postJson("/api/admin/candidate-consents/{$consentId}/release");
        $releaseRes->assertStatus(201);
        $releaseId = $releaseRes->json('data.release_id');

        // A plain Recruiter (no CandidateReleaseApprove) must not be able to do this.
        Auth::forgetGuards();
        $secondConsent = CandidateConsent::create([
            'expert_pool_profile_id' => $profile->id,
            'organisation_id' => $organisation->id,
            'status' => 'consented',
            'purpose' => 'test',
            'consent_text_version' => 'v1',
            'requested_at' => now(),
            'consented_at' => now(),
        ]);
        $this->withToken($recruiterToken)
            ->postJson("/api/admin/candidate-consents/{$secondConsent->id}/release")
            ->assertStatus(403);

        // --- 12. Organisation now sees exactly the released candidate, allowlist-only ---
        Auth::forgetGuards();
        $indexRes = $this->withToken($orgToken)->getJson('/api/organisation/released-candidates');
        $indexRes->assertStatus(200)->assertJsonCount(1, 'data');

        $showRes = $this->withToken($orgToken)->getJson("/api/organisation/released-candidates/{$releaseId}");
        $showRes->assertStatus(200);
        $candidate = $showRes->json('data.candidate');

        $this->assertArrayHasKey('candidate_reference', $candidate);
        $this->assertArrayHasKey('professional_title', $candidate);
        $this->assertArrayNotHasKey('email', $candidate);
        $this->assertArrayNotHasKey('name', $candidate);
        $this->assertArrayNotHasKey('cv_path', $candidate);

        // --- 13. Organisation can comment and indicate interest ---
        $this->withToken($orgToken)
            ->postJson("/api/organisation/released-candidates/{$releaseId}/comments", ['comment' => 'Strong fit, scheduling a call.'])
            ->assertStatus(201);

        $this->withToken($orgToken)
            ->patchJson("/api/organisation/released-candidates/{$releaseId}/status", ['organisation_status' => 'interested'])
            ->assertStatus(200)
            ->assertJsonPath('data.organisation_status', 'interested');
    }
}
