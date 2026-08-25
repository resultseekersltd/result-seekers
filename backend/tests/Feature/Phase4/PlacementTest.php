<?php

namespace Tests\Feature\Phase4;

use App\Enums\CandidateConsentStatus;
use App\Enums\ExpertVisibility;
use App\Enums\RsRole;
use App\Models\AuditLog;
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

class PlacementTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{0: Organisation, 1: RecruitmentAssignment, 2: CandidatePipelineEntry, 3: User, 4: ExpertUser}
     */
    private function makeReleasedEntry(): array
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

        return [$organisation, $assignment, $entry, $recruiter, $expertUser];
    }

    /** @test */
    public function the_owning_recruiter_can_create_a_placement(): void
    {
        [, $assignment, $entry, $recruiter] = $this->makeReleasedEntry();
        $token = $recruiter->createToken('admin-session')->plainTextToken;

        $res = $this->withToken($token)->postJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/placement",
            ['engagement_type' => 'consultancy', 'start_date' => now()->addWeek()->toDateString()],
        );

        $res->assertStatus(201)->assertJsonPath('data.status', 'pending_confirmation');
        $this->assertDatabaseHas('audit_logs', ['action' => 'placement.created']);
    }

    /** @test */
    public function an_unrelated_recruiter_receives_403(): void
    {
        [, $assignment, $entry] = $this->makeReleasedEntry();

        $outsider = User::factory()->create(['role' => RsRole::Recruiter]);
        $token = $outsider->createToken('admin-session')->plainTextToken;

        $this->withToken($token)->postJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/placement",
            ['engagement_type' => 'consultancy'],
        )->assertStatus(403);
    }

    /** @test */
    public function a_verifier_cannot_create_a_placement(): void
    {
        [, $assignment, $entry] = $this->makeReleasedEntry();

        $verifier = User::factory()->create(['role' => RsRole::Verifier]);
        $token = $verifier->createToken('admin-session')->plainTextToken;

        $this->withToken($token)->postJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/placement",
            ['engagement_type' => 'consultancy'],
        )->assertStatus(403);
    }

    /** @test */
    public function cross_organisation_placement_access_is_blocked(): void
    {
        [, $assignment, $entry, $recruiter] = $this->makeReleasedEntry();
        $token = $recruiter->createToken('admin-session')->plainTextToken;

        $placementRes = $this->withToken($token)->postJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/placement",
            [],
        );
        $placementId = Placement::first()->id;
        $this->assertNotNull($placementId);

        Auth::forgetGuards();
        $otherOrganisation = Organisation::factory()->verified()->create();
        $otherOrgUser = OrganisationUser::factory()->create(['organisation_id' => $otherOrganisation->id]);
        $otherOrgToken = $otherOrgUser->createToken('organisation-session')->plainTextToken;

        $this->withToken($otherOrgToken)->getJson("/api/organisation/placements/{$placementId}")->assertStatus(403);
        $this->withToken($otherOrgToken)->postJson("/api/organisation/placements/{$placementId}/confirm")->assertStatus(403);
        $this->withToken($otherOrgToken)->getJson('/api/organisation/placements')->assertStatus(200)->assertJsonCount(0, 'data');

        // Silence unused variable warning from the earlier response.
        $placementRes->assertStatus(201);
    }

    /** @test */
    public function cross_candidate_id_manipulation_is_blocked_on_the_professional_side(): void
    {
        [, $assignment, $entry] = $this->makeReleasedEntry();
        $recruiter = $assignment->recruiter;
        $token = $recruiter->createToken('admin-session')->plainTextToken;

        $this->withToken($token)->postJson("/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/placement", []);
        $placementId = Placement::first()->id;

        Auth::forgetGuards();
        $unrelatedExpert = ExpertUser::factory()->create();
        $unrelatedToken = $unrelatedExpert->createToken('expert-session')->plainTextToken;

        $this->withToken($unrelatedToken)->getJson("/api/expert-pool/placements/{$placementId}")->assertStatus(404);
        $this->withToken($unrelatedToken)->postJson("/api/expert-pool/placements/{$placementId}/confirm")->assertStatus(404);
    }

    /** @test */
    public function professional_confirmation_alone_leaves_placement_pending(): void
    {
        [, $assignment, $entry, $recruiter, $expertUser] = $this->makeReleasedEntry();
        $recruiterToken = $recruiter->createToken('admin-session')->plainTextToken;

        $this->withToken($recruiterToken)->postJson("/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/placement", []);
        $placement = Placement::first();

        Auth::forgetGuards();
        $expertToken = $expertUser->createToken('expert-session')->plainTextToken;

        $this->withToken($expertToken)->postJson("/api/expert-pool/placements/{$placement->id}/confirm")
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'pending_confirmation');

        $this->assertNull($entry->fresh()->outcome);
        $this->assertSame('pending_confirmation', $placement->fresh()->status->value);
    }

    /** @test */
    public function placement_requires_both_confirmations_before_becoming_placed(): void
    {
        [, $assignment, $entry, $recruiter, $expertUser] = $this->makeReleasedEntry();
        $recruiterToken = $recruiter->createToken('admin-session')->plainTextToken;

        $this->withToken($recruiterToken)->postJson("/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/placement", []);
        $placement = Placement::first();

        // Organisation confirms alone — must remain pending.
        Auth::forgetGuards();
        $orgUser = OrganisationUser::factory()->create(['organisation_id' => $entry->assignment->organisation_id]);
        $orgToken = $orgUser->createToken('organisation-session')->plainTextToken;

        $this->withToken($orgToken)->postJson("/api/organisation/placements/{$placement->id}/confirm")
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'pending_confirmation');

        $this->assertNull($entry->fresh()->outcome);

        // Professional confirms too — now both sides are in, so it becomes Placed.
        Auth::forgetGuards();
        $expertToken = $expertUser->createToken('expert-session')->plainTextToken;

        $this->withToken($expertToken)->postJson("/api/expert-pool/placements/{$placement->id}/confirm")
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'confirmed');

        $this->assertSame('placed', $entry->fresh()->outcome->value);
        $this->assertDatabaseHas('audit_logs', ['action' => 'placement.placed']);
    }

    /** @test */
    public function duplicate_confirmation_is_handled_safely(): void
    {
        [, $assignment, $entry, $recruiter] = $this->makeReleasedEntry();
        $recruiterToken = $recruiter->createToken('admin-session')->plainTextToken;

        $this->withToken($recruiterToken)->postJson("/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/placement", []);
        $placement = Placement::first();

        Auth::forgetGuards();
        $orgUser = OrganisationUser::factory()->create(['organisation_id' => $entry->assignment->organisation_id]);
        $orgToken = $orgUser->createToken('organisation-session')->plainTextToken;

        $this->withToken($orgToken)->postJson("/api/organisation/placements/{$placement->id}/confirm")->assertStatus(200);
        $firstConfirmedAt = $placement->fresh()->organisation_confirmed_at;

        // Confirming again must not error and must not change the recorded timestamp.
        $this->withToken($orgToken)->postJson("/api/organisation/placements/{$placement->id}/confirm")->assertStatus(200);
        $this->assertTrue($firstConfirmedAt->equalTo($placement->fresh()->organisation_confirmed_at));

        $this->assertSame(
            1,
            AuditLog::where('action', 'placement.organisation_confirmed')->count(),
            'Re-confirming must not write a second audit row.',
        );
    }

    /** @test */
    public function a_cancelled_placement_cannot_be_revived_by_a_later_organisation_confirmation(): void
    {
        [, $assignment, $entry, $recruiter, $expertUser] = $this->makeReleasedEntry();
        $recruiterToken = $recruiter->createToken('admin-session')->plainTextToken;

        $this->withToken($recruiterToken)->postJson("/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/placement", []);
        $placement = Placement::first();

        Auth::forgetGuards();
        $expertToken = $expertUser->createToken('expert-session')->plainTextToken;
        $this->withToken($expertToken)->postJson("/api/expert-pool/placements/{$placement->id}/confirm")->assertStatus(200);

        Auth::forgetGuards();
        $this->withToken($recruiterToken)->patchJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/placement/cancel",
        )->assertStatus(200);
        $this->assertSame('cancelled', $placement->fresh()->status->value);

        Auth::forgetGuards();
        $orgUser = OrganisationUser::factory()->create(['organisation_id' => $entry->assignment->organisation_id]);
        $orgToken = $orgUser->createToken('organisation-session')->plainTextToken;
        $this->withToken($orgToken)->postJson("/api/organisation/placements/{$placement->id}/confirm")->assertStatus(422);

        $this->assertSame('cancelled', $placement->fresh()->status->value);
        $this->assertNull($entry->fresh()->outcome);
        $this->assertDatabaseMissing('audit_logs', ['action' => 'placement.placed']);
    }

    /** @test */
    public function a_cancelled_placement_cannot_be_revived_by_a_later_professional_confirmation(): void
    {
        [, $assignment, $entry, $recruiter, $expertUser] = $this->makeReleasedEntry();
        $recruiterToken = $recruiter->createToken('admin-session')->plainTextToken;

        $this->withToken($recruiterToken)->postJson("/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/placement", []);
        $placement = Placement::first();

        Auth::forgetGuards();
        $orgUser = OrganisationUser::factory()->create(['organisation_id' => $entry->assignment->organisation_id]);
        $orgToken = $orgUser->createToken('organisation-session')->plainTextToken;
        $this->withToken($orgToken)->postJson("/api/organisation/placements/{$placement->id}/confirm")->assertStatus(200);

        Auth::forgetGuards();
        $this->withToken($recruiterToken)->patchJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/placement/cancel",
        )->assertStatus(200);
        $this->assertSame('cancelled', $placement->fresh()->status->value);

        // This is the exact sequence the Phase 4 acceptance audit reproduced as a live defect:
        // organisation confirms -> admin cancels -> professional confirms -> the placement must
        // remain Cancelled, never Confirmed/Placed.
        Auth::forgetGuards();
        $expertToken = $expertUser->createToken('expert-session')->plainTextToken;
        $this->withToken($expertToken)->postJson("/api/expert-pool/placements/{$placement->id}/confirm")->assertStatus(422);

        $this->assertSame('cancelled', $placement->fresh()->status->value);
        $this->assertNull($entry->fresh()->outcome);
        $this->assertDatabaseMissing('audit_logs', ['action' => 'placement.placed']);
    }
}
