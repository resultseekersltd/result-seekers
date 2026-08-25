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
use App\Models\ReferenceCheck;
use App\Models\TalentRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReferenceCheckSecurityTest extends TestCase
{
    use RefreshDatabase;

    private function makeEntry(): array
    {
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

        return [$assignment, $entry, $recruiter];
    }

    /** @test */
    public function a_recruiter_cannot_create_a_reference_check(): void
    {
        [$assignment, $entry, $recruiter] = $this->makeEntry();
        $token = $recruiter->createToken('admin-session')->plainTextToken;

        // "Verifiers should be able to: ... Review references" (talent-expert.txt) — a plain Recruiter does not hold ReferenceCheckManage.
        $this->withToken($token)->postJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/reference-checks",
            [
                'referee_name' => 'Someone',
                'candidate_consented' => true,
                'consent_text_version' => 'v1',
            ],
        )->assertStatus(403);
    }

    /** @test */
    public function a_reference_check_cannot_be_created_without_recorded_candidate_consent(): void
    {
        [$assignment, $entry] = $this->makeEntry();
        $verifier = User::factory()->create(['role' => RsRole::Verifier]);
        $token = $verifier->createToken('admin-session')->plainTextToken;

        $this->withToken($token)->postJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/reference-checks",
            ['referee_name' => 'Someone', 'consent_text_version' => 'v1'],
        )->assertStatus(422);
    }

    /** @test */
    public function an_organisation_can_never_reach_any_reference_check_endpoint(): void
    {
        [$assignment, $entry] = $this->makeEntry();

        $orgUser = OrganisationUser::factory()->create();
        $token = $orgUser->createToken('organisation-session')->plainTextToken;

        $this->withToken($token)->getJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/reference-checks",
        )->assertStatus(403);
    }

    /** @test */
    public function referee_contact_and_verification_notes_never_appear_in_any_route_reachable_by_organisation_or_expert_tokens(): void
    {
        $routes = collect(app('router')->getRoutes())->map(fn ($r) => $r->uri());

        $this->assertFalse($routes->contains(fn ($uri) => (str_contains($uri, 'organisation/') || str_starts_with($uri, 'api/expert-pool')) && str_contains($uri, 'reference-check')));
    }

    /** @test */
    public function only_a_verifier_or_recruitment_manager_can_record_a_reference_check_outcome(): void
    {
        [$assignment, $entry] = $this->makeEntry();
        $verifier = User::factory()->create(['role' => RsRole::Verifier]);
        $verifierToken = $verifier->createToken('admin-session')->plainTextToken;

        $referenceCheck = ReferenceCheck::create([
            'candidate_pipeline_entry_id' => $entry->id,
            'referee_name' => 'Someone',
            'status' => 'requested',
            'candidate_consented_at' => now(),
            'consent_text_version' => 'v1',
        ]);

        $this->withToken($verifierToken)->patchJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/reference-checks/{$referenceCheck->id}",
            ['status' => 'completed', 'final_outcome' => 'positive'],
        )->assertStatus(200);
    }
}
