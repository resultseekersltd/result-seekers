<?php

namespace Tests\Feature\Phase3;

use App\Enums\CandidateConsentStatus;
use App\Enums\ExpertVisibility;
use App\Enums\RsRole;
use App\Models\CandidateConsent;
use App\Models\CandidateEvaluation;
use App\Models\DataRelease;
use App\Models\ExpertPoolProfile;
use App\Models\ExpertUser;
use App\Models\Organisation;
use App\Models\OrganisationUser;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class OrganisationEvaluationSecurityTest extends TestCase
{
    use RefreshDatabase;

    private function makeRelease(Organisation $organisation): DataRelease
    {
        $expertUser = ExpertUser::factory()->create();
        $profile = ExpertPoolProfile::create([
            'expert_user_id' => $expertUser->id,
            'professional_title' => 'Data Analyst',
            'country' => 'Nigeria',
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
            'released_fields' => ['candidate_reference' => 'CAND-TEST-1'],
            'purpose' => 'test',
            'released_at' => now(),
        ]);
    }

    /** @test */
    public function an_organisation_can_evaluate_a_candidate_that_has_actually_been_released_to_them(): void
    {
        $organisation = Organisation::factory()->verified()->create();
        $release = $this->makeRelease($organisation);
        $orgUser = OrganisationUser::factory()->create(['organisation_id' => $organisation->id]);
        $token = $orgUser->createToken('organisation-session')->plainTextToken;

        $this->withToken($token)->postJson("/api/organisation/released-candidates/{$release->id}/evaluations", [
            'score' => 80,
            'final_outcome' => 'pending',
        ])->assertStatus(201);
    }

    /** @test */
    public function an_organisation_cannot_evaluate_a_release_belonging_to_another_organisation(): void
    {
        $organisationA = Organisation::factory()->verified()->create();
        $organisationB = Organisation::factory()->verified()->create();
        $releaseB = $this->makeRelease($organisationB);

        $orgUserA = OrganisationUser::factory()->create(['organisation_id' => $organisationA->id]);
        $tokenA = $orgUserA->createToken('organisation-session')->plainTextToken;

        $this->withToken($tokenA)->postJson("/api/organisation/released-candidates/{$releaseB->id}/evaluations", [
            'final_outcome' => 'selected',
        ])->assertStatus(403);

        $this->assertSame(0, CandidateEvaluation::count());
    }

    /** @test */
    public function an_organisation_cannot_evaluate_a_candidate_that_has_never_been_released_to_anyone(): void
    {
        $organisation = Organisation::factory()->verified()->create();
        $orgUser = OrganisationUser::factory()->create(['organisation_id' => $organisation->id]);
        $token = $orgUser->createToken('organisation-session')->plainTextToken;

        // No DataRelease row exists at all for this fabricated ID — the release genuinely does not exist.
        $this->withToken($token)->postJson('/api/organisation/released-candidates/01JFAKE000000000000000000/evaluations', [
            'final_outcome' => 'selected',
        ])->assertStatus(404);
    }

    /** @test */
    public function one_evaluators_evaluation_cannot_be_edited_by_a_different_organisation_user_at_the_same_organisation(): void
    {
        $organisation = Organisation::factory()->verified()->create();
        $release = $this->makeRelease($organisation);

        $evaluatorA = OrganisationUser::factory()->create(['organisation_id' => $organisation->id]);
        $tokenA = $evaluatorA->createToken('organisation-session')->plainTextToken;
        $createRes = $this->withToken($tokenA)->postJson("/api/organisation/released-candidates/{$release->id}/evaluations", [
            'final_outcome' => 'pending',
        ]);
        $evaluationId = $createRes->json('data.id');

        Auth::forgetGuards();
        $evaluatorB = OrganisationUser::factory()->create(['organisation_id' => $organisation->id]);
        $tokenB = $evaluatorB->createToken('organisation-session')->plainTextToken;

        $this->withToken($tokenB)->patchJson(
            "/api/organisation/released-candidates/{$release->id}/evaluations/{$evaluationId}",
            ['final_outcome' => 'not_selected'],
        )->assertStatus(403);
    }

    /** @test */
    public function multiple_evaluators_can_independently_score_the_same_candidate(): void
    {
        $organisation = Organisation::factory()->verified()->create();
        $release = $this->makeRelease($organisation);

        $evaluatorA = OrganisationUser::factory()->create(['organisation_id' => $organisation->id]);
        $tokenA = $evaluatorA->createToken('organisation-session')->plainTextToken;
        $this->withToken($tokenA)->postJson("/api/organisation/released-candidates/{$release->id}/evaluations", ['score' => 70])->assertStatus(201);

        Auth::forgetGuards();
        $evaluatorB = OrganisationUser::factory()->create(['organisation_id' => $organisation->id]);
        $tokenB = $evaluatorB->createToken('organisation-session')->plainTextToken;
        $this->withToken($tokenB)->postJson("/api/organisation/released-candidates/{$release->id}/evaluations", ['score' => 95])->assertStatus(201);

        Auth::forgetGuards();
        $this->withToken($tokenA)->getJson("/api/organisation/released-candidates/{$release->id}/evaluations")
            ->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }
}
