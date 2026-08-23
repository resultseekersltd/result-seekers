<?php

namespace Tests\Feature\RecruitmentPipeline;

use App\Enums\CandidateConsentStatus;
use App\Enums\ExpertVisibility;
use App\Enums\RsRole;
use App\Models\CandidateConsent;
use App\Models\DataRelease;
use App\Models\ExpertPoolProfile;
use App\Models\ExpertUser;
use App\Models\Organisation;
use App\Models\OrganisationUser;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

/**
 * Section 18/19 "CONTROLLED DATA RELEASE" / "ORGANISATION REVIEW
 * WORKSPACE" — asserts the single most important business rule in the
 * whole Phase 2 prompt: an organisation only ever sees a candidate that
 * Result Seekers has deliberately released, through the full workflow,
 * with an allowlisted field snapshot, never a live profile join.
 */
class ControlledReleaseTest extends TestCase
{
    use RefreshDatabase;

    private function makeConsentedProfile(Organisation $organisation): CandidateConsent
    {
        $expertUser = ExpertUser::factory()->create();
        $profile = ExpertPoolProfile::create([
            'expert_user_id' => $expertUser->id,
            'professional_title' => 'Senior MEAL Specialist',
            'country' => 'Nigeria',
            'years_experience' => 10,
            'visibility_status' => ExpertVisibility::AnonymousMatching,
        ]);

        return CandidateConsent::create([
            'expert_pool_profile_id' => $profile->id,
            'organisation_id' => $organisation->id,
            'status' => CandidateConsentStatus::Consented,
            'purpose' => 'test',
            'consent_text_version' => 'v1',
            'requested_at' => now(),
            'consented_at' => now(),
        ]);
    }

    /** @test */
    public function a_candidate_cannot_be_released_without_granted_consent(): void
    {
        $organisation = Organisation::factory()->verified()->create();
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
            'status' => CandidateConsentStatus::Requested,
            'purpose' => 'test',
            'consent_text_version' => 'v1',
            'requested_at' => now(),
        ]);

        $manager = User::factory()->create(['role' => RsRole::RecruitmentManager]);
        $token = $manager->createToken('admin-session')->plainTextToken;

        $this->withToken($token)
            ->postJson("/api/admin/candidate-consents/{$consent->id}/release")
            ->assertStatus(422);

        $this->assertSame(0, DataRelease::count());
    }

    /** @test */
    public function a_plain_recruiter_cannot_approve_a_release(): void
    {
        $organisation = Organisation::factory()->verified()->create();
        $consent = $this->makeConsentedProfile($organisation);

        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        $token = $recruiter->createToken('admin-session')->plainTextToken;

        $this->withToken($token)
            ->postJson("/api/admin/candidate-consents/{$consent->id}/release")
            ->assertStatus(403);

        $this->assertSame(0, DataRelease::count());
    }

    /** @test */
    public function an_organisation_cannot_access_a_candidate_that_has_not_been_released(): void
    {
        $organisation = Organisation::factory()->verified()->create();
        $this->makeConsentedProfile($organisation); // consented, but not yet released

        $orgUser = OrganisationUser::factory()->create(['organisation_id' => $organisation->id]);
        $orgToken = $orgUser->createToken('organisation-session')->plainTextToken;

        $this->withToken($orgToken)->getJson('/api/organisation/released-candidates')
            ->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    /** @test */
    public function a_released_candidate_exposes_only_the_allowlisted_fields(): void
    {
        $organisation = Organisation::factory()->verified()->create();
        $consent = $this->makeConsentedProfile($organisation);

        $manager = User::factory()->create(['role' => RsRole::RecruitmentManager]);
        $managerToken = $manager->createToken('admin-session')->plainTextToken;

        $releaseRes = $this->withToken($managerToken)
            ->postJson("/api/admin/candidate-consents/{$consent->id}/release")
            ->assertStatus(201);
        $releaseId = $releaseRes->json('data.release_id');

        Auth::forgetGuards();
        $orgUser = OrganisationUser::factory()->create(['organisation_id' => $organisation->id]);
        $orgToken = $orgUser->createToken('organisation-session')->plainTextToken;

        $show = $this->withToken($orgToken)->getJson("/api/organisation/released-candidates/{$releaseId}")
            ->assertStatus(200);

        $candidate = $show->json('data.candidate');
        $this->assertEqualsCanonicalizing(
            ['candidate_reference', 'professional_title', 'years_experience', 'highest_qualification', 'country', 'state', 'disciplines', 'industries', 'languages', 'verification_level'],
            array_keys($candidate)
        );
    }

    /** @test */
    public function organisation_a_cannot_access_organisation_bs_release(): void
    {
        $organisationA = Organisation::factory()->verified()->create();
        $organisationB = Organisation::factory()->verified()->create();
        $consentB = $this->makeConsentedProfile($organisationB);

        $manager = User::factory()->create(['role' => RsRole::RecruitmentManager]);
        $managerToken = $manager->createToken('admin-session')->plainTextToken;
        $releaseRes = $this->withToken($managerToken)
            ->postJson("/api/admin/candidate-consents/{$consentB->id}/release")
            ->assertStatus(201);
        $releaseId = $releaseRes->json('data.release_id');

        Auth::forgetGuards();
        $orgUserA = OrganisationUser::factory()->create(['organisation_id' => $organisationA->id]);
        $tokenA = $orgUserA->createToken('organisation-session')->plainTextToken;

        $this->withToken($tokenA)->getJson("/api/organisation/released-candidates/{$releaseId}")
            ->assertStatus(403);

        $this->withToken($tokenA)->getJson('/api/organisation/released-candidates')
            ->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }
}
