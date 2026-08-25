<?php

namespace Tests\Feature\RecruitmentPipeline;

use App\Enums\CandidateConsentStatus;
use App\Enums\CandidatePipelineStage;
use App\Enums\ExpertVisibility;
use App\Enums\RsRole;
use App\Models\CandidateConsent;
use App\Models\CandidatePipelineEntry;
use App\Models\ExpertPoolProfile;
use App\Models\ExpertUser;
use App\Models\OpportunityInvitation;
use App\Models\Organisation;
use App\Models\OrganisationUser;
use App\Models\RecruitmentAssignment;
use App\Models\TalentRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class InvitationAndConsentTest extends TestCase
{
    use RefreshDatabase;

    private function makeShortlistedEntry(User $recruiter): CandidatePipelineEntry
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
            'professional_title' => 'Senior MEAL Specialist',
            'country' => 'Nigeria',
            'years_experience' => 10,
            'visibility_status' => ExpertVisibility::AnonymousMatching,
        ]);

        return CandidatePipelineEntry::create([
            'recruitment_assignment_id' => $assignment->id,
            'expert_pool_profile_id' => $profile->id,
            'stage' => CandidatePipelineStage::Shortlisted,
            'added_by' => $recruiter->id,
        ]);
    }

    /** @test */
    public function only_the_owning_recruiter_or_a_manager_can_invite_a_shortlisted_candidate(): void
    {
        $recruiterA = User::factory()->create(['role' => RsRole::Recruiter]);
        $recruiterB = User::factory()->create(['role' => RsRole::Recruiter]);
        $entry = $this->makeShortlistedEntry($recruiterA);

        $tokenB = $recruiterB->createToken('admin-session')->plainTextToken;
        $this->withToken($tokenB)
            ->postJson("/api/admin/recruitment-assignments/{$entry->recruitment_assignment_id}/pipeline/{$entry->id}/invite")
            ->assertStatus(403);

        Auth::forgetGuards();
        $tokenA = $recruiterA->createToken('admin-session')->plainTextToken;
        $this->withToken($tokenA)
            ->postJson("/api/admin/recruitment-assignments/{$entry->recruitment_assignment_id}/pipeline/{$entry->id}/invite")
            ->assertStatus(201);
    }

    /** @test */
    public function an_organisation_cannot_create_an_opportunity_invitation(): void
    {
        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        $entry = $this->makeShortlistedEntry($recruiter);
        $orgUser = OrganisationUser::factory()->create(['organisation_id' => $entry->assignment->organisation_id]);
        $orgToken = $orgUser->createToken('organisation-session')->plainTextToken;

        $this->withToken($orgToken)
            ->postJson("/api/admin/recruitment-assignments/{$entry->recruitment_assignment_id}/pipeline/{$entry->id}/invite")
            ->assertStatus(403);
    }

    /** @test */
    public function a_professional_can_only_respond_to_their_own_invitation(): void
    {
        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        $entry = $this->makeShortlistedEntry($recruiter);

        $token = $recruiter->createToken('admin-session')->plainTextToken;
        $this->withToken($token)
            ->postJson("/api/admin/recruitment-assignments/{$entry->recruitment_assignment_id}/pipeline/{$entry->id}/invite")
            ->assertStatus(201);

        $invitation = OpportunityInvitation::where('candidate_pipeline_entry_id', $entry->id)->firstOrFail();

        $otherExpert = ExpertUser::factory()->create();
        $otherToken = $otherExpert->createToken('expert-session')->plainTextToken;

        Auth::forgetGuards();
        $this->withToken($otherToken)
            ->postJson("/api/expert-pool/opportunities/{$invitation->id}/respond", ['response' => 'accept'])
            ->assertStatus(404);

        Auth::forgetGuards();
        $ownerExpertToken = $entry->profile->expertUser->createToken('expert-session')->plainTextToken;
        $this->withToken($ownerExpertToken)
            ->postJson("/api/expert-pool/opportunities/{$invitation->id}/respond", ['response' => 'accept'])
            ->assertStatus(200);
    }

    /** @test */
    public function only_the_professional_themself_can_create_consent_on_their_own_behalf(): void
    {
        $profileOwner = ExpertUser::factory()->create();
        $profile = ExpertPoolProfile::create([
            'expert_user_id' => $profileOwner->id,
            'professional_title' => 'Senior MEAL Specialist',
            'country' => 'Nigeria',
            'years_experience' => 10,
            'visibility_status' => ExpertVisibility::AnonymousMatching,
        ]);
        $organisation = Organisation::factory()->verified()->create();

        $consent = CandidateConsent::create([
            'expert_pool_profile_id' => $profile->id,
            'organisation_id' => $organisation->id,
            'status' => CandidateConsentStatus::Requested,
            'purpose' => 'test',
            'consent_text_version' => 'v1',
            'requested_at' => now(),
        ]);

        $otherExpert = ExpertUser::factory()->create();
        $otherToken = $otherExpert->createToken('expert-session')->plainTextToken;

        $this->withToken($otherToken)
            ->postJson("/api/expert-pool/consents/{$consent->id}/respond", ['response' => 'grant'])
            ->assertStatus(404);

        Auth::forgetGuards();
        $ownerToken = $profileOwner->createToken('expert-session')->plainTextToken;
        $this->withToken($ownerToken)
            ->postJson("/api/expert-pool/consents/{$consent->id}/respond", ['response' => 'grant'])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'consented');
    }

    /** @test */
    public function a_decline_response_is_recorded_and_does_not_grant_consent(): void
    {
        $profileOwner = ExpertUser::factory()->create();
        $profile = ExpertPoolProfile::create([
            'expert_user_id' => $profileOwner->id,
            'professional_title' => 'Senior MEAL Specialist',
            'country' => 'Nigeria',
            'years_experience' => 10,
            'visibility_status' => ExpertVisibility::AnonymousMatching,
        ]);
        $organisation = Organisation::factory()->verified()->create();

        $consent = CandidateConsent::create([
            'expert_pool_profile_id' => $profile->id,
            'organisation_id' => $organisation->id,
            'status' => CandidateConsentStatus::Requested,
            'purpose' => 'test',
            'consent_text_version' => 'v1',
            'requested_at' => now(),
        ]);

        $token = $profileOwner->createToken('expert-session')->plainTextToken;
        $this->withToken($token)
            ->postJson("/api/expert-pool/consents/{$consent->id}/respond", ['response' => 'decline'])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'declined');

        $this->assertSame(CandidateConsentStatus::Declined, $consent->fresh()->status);
    }

    /** @test */
    public function consent_cannot_be_forged_via_pipeline_entry_id_manipulation(): void
    {
        $recruiterA = User::factory()->create(['role' => RsRole::Recruiter]);
        $entryA = $this->makeShortlistedEntry($recruiterA);

        $recruiterB = User::factory()->create(['role' => RsRole::Recruiter]);
        $entryB = $this->makeShortlistedEntry($recruiterB);

        // Move entryA to "interested" so consent can legitimately be requested against it.
        $entryA->update(['stage' => CandidatePipelineStage::Interested]);

        $tokenA = $recruiterA->createToken('admin-session')->plainTextToken;
        $consentRes = $this->withToken($tokenA)
            ->postJson("/api/admin/recruitment-assignments/{$entryA->recruitment_assignment_id}/pipeline/{$entryA->id}/request-consent")
            ->assertStatus(201);
        $consentId = $consentRes->json('data.consent_id');

        $consent = CandidateConsent::findOrFail($consentId);
        $this->assertSame($entryA->id, $consent->candidate_pipeline_entry_id);
        $this->assertNotSame($entryB->id, $consent->candidate_pipeline_entry_id);
    }
}
