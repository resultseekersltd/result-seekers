<?php

namespace Tests\Feature\Phase4;

use App\Enums\CandidateConsentStatus;
use App\Enums\ExpertVisibility;
use App\Enums\PlacementStatus;
use App\Enums\RsRole;
use App\Models\CandidateConsent;
use App\Models\CandidatePipelineEntry;
use App\Models\DataRelease;
use App\Models\ExpertPoolProfile;
use App\Models\ExpertUser;
use App\Models\Organisation;
use App\Models\OrganisationUser;
use App\Models\Placement;
use App\Models\RecruitmentAssignment;
use App\Models\TalentRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class AssignmentFeedbackTest extends TestCase
{
    use RefreshDatabase;

    /** @return array{0: Organisation, 1: User, 2: ExpertUser, 3: Placement} */
    private function makeConfirmedPlacement(): array
    {
        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        $manager = User::factory()->create(['role' => RsRole::RecruitmentManager]);
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
            'stage' => 'released',
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
        DataRelease::create([
            'candidate_consent_id' => $consent->id,
            'released_to_organisation_id' => $organisation->id,
            'released_by' => $manager->id,
            'released_fields' => ['candidate_reference' => 'CAND-TEST-1'],
            'purpose' => 'test',
            'released_at' => now(),
        ]);

        $placement = Placement::create([
            'candidate_pipeline_entry_id' => $entry->id,
            'status' => PlacementStatus::Confirmed,
            'organisation_confirmed_at' => now(),
            'professional_confirmed_at' => now(),
        ]);

        return [$organisation, $recruiter, $expertUser, $placement];
    }

    /** @test */
    public function the_organisation_can_submit_its_feedback(): void
    {
        [$organisation, , , $placement] = $this->makeConfirmedPlacement();
        $orgUser = OrganisationUser::factory()->create(['organisation_id' => $organisation->id]);
        $token = $orgUser->createToken('organisation-session')->plainTextToken;

        $this->withToken($token)->postJson("/api/organisation/placements/{$placement->id}/feedback", [
            'rating' => 5,
            'comments' => 'Excellent professional.',
        ])->assertStatus(201)->assertJsonPath('data.is_mine', true);
    }

    /** @test */
    public function the_professional_can_submit_its_feedback(): void
    {
        [, , $expertUser, $placement] = $this->makeConfirmedPlacement();
        $token = $expertUser->createToken('expert-session')->plainTextToken;

        $this->withToken($token)->postJson("/api/expert-pool/placements/{$placement->id}/feedback", [
            'rating' => 4,
            'comments' => 'Good working environment.',
        ])->assertStatus(201)->assertJsonPath('data.is_mine', true);
    }

    /** @test */
    public function resubmitting_feedback_updates_the_same_row_rather_than_creating_a_duplicate(): void
    {
        [$organisation, , , $placement] = $this->makeConfirmedPlacement();
        $orgUser = OrganisationUser::factory()->create(['organisation_id' => $organisation->id]);
        $token = $orgUser->createToken('organisation-session')->plainTextToken;

        $this->withToken($token)->postJson("/api/organisation/placements/{$placement->id}/feedback", ['rating' => 3]);
        $this->withToken($token)->postJson("/api/organisation/placements/{$placement->id}/feedback", ['rating' => 5]);

        $this->assertSame(1, $placement->feedback()->count());
        $this->assertSame(5, $placement->feedback()->first()->rating);
    }

    /** @test */
    public function cross_organisation_feedback_access_is_blocked(): void
    {
        [, , , $placement] = $this->makeConfirmedPlacement();

        $otherOrganisation = Organisation::factory()->verified()->create();
        $otherOrgUser = OrganisationUser::factory()->create(['organisation_id' => $otherOrganisation->id]);
        $token = $otherOrgUser->createToken('organisation-session')->plainTextToken;

        $this->withToken($token)->postJson("/api/organisation/placements/{$placement->id}/feedback", ['rating' => 1])->assertStatus(403);
        $this->withToken($token)->getJson("/api/organisation/placements/{$placement->id}/feedback")->assertStatus(403);
    }

    /** @test */
    public function cross_candidate_feedback_access_is_blocked_for_an_unrelated_professional(): void
    {
        [, , , $placement] = $this->makeConfirmedPlacement();

        $unrelatedExpert = ExpertUser::factory()->create();
        $token = $unrelatedExpert->createToken('expert-session')->plainTextToken;

        $this->withToken($token)->postJson("/api/expert-pool/placements/{$placement->id}/feedback", ['rating' => 1])->assertStatus(403);
    }

    /** @test */
    public function feedback_remains_private_until_both_required_submissions_exist(): void
    {
        [$organisation, , $expertUser, $placement] = $this->makeConfirmedPlacement();
        $orgUser = OrganisationUser::factory()->create(['organisation_id' => $organisation->id]);
        $orgToken = $orgUser->createToken('organisation-session')->plainTextToken;

        $this->withToken($orgToken)->postJson("/api/organisation/placements/{$placement->id}/feedback", ['rating' => 5])->assertStatus(201);

        // Only the organisation's own submission exists — the professional (who hasn't submitted) sees nothing yet.
        Auth::forgetGuards();
        $expertToken = $expertUser->createToken('expert-session')->plainTextToken;
        $this->withToken($expertToken)->getJson("/api/expert-pool/placements/{$placement->id}/feedback")
            ->assertStatus(200)
            ->assertJsonCount(0, 'data');

        // Professional submits their own — now both exist, so the organisation's view opens up to include it too.
        Auth::forgetGuards();
        $this->withToken($expertToken)->postJson("/api/expert-pool/placements/{$placement->id}/feedback", ['rating' => 4])->assertStatus(201);

        Auth::forgetGuards();
        $this->withToken($orgToken)->getJson("/api/organisation/placements/{$placement->id}/feedback")
            ->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    /** @test */
    public function the_owning_recruitment_manager_can_view_feedback_even_before_both_sides_have_submitted(): void
    {
        [$organisation, $recruiter, , $placement] = $this->makeConfirmedPlacement();
        $orgUser = OrganisationUser::factory()->create(['organisation_id' => $organisation->id]);
        $orgToken = $orgUser->createToken('organisation-session')->plainTextToken;

        $this->withToken($orgToken)->postJson("/api/organisation/placements/{$placement->id}/feedback", ['rating' => 5]);

        Auth::forgetGuards();
        $manager = User::factory()->create(['role' => RsRole::RecruitmentManager]);
        $managerToken = $manager->createToken('admin-session')->plainTextToken;

        $entry = $placement->pipelineEntry;
        $this->withToken($managerToken)->getJson(
            "/api/admin/recruitment-assignments/{$entry->recruitment_assignment_id}/pipeline/{$entry->id}/feedback",
        )->assertStatus(200)->assertJsonCount(1, 'data');
    }
}
