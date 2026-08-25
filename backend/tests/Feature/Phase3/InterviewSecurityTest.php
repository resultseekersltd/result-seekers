<?php

namespace Tests\Feature\Phase3;

use App\Enums\ExpertVisibility;
use App\Enums\RsRole;
use App\Models\CandidatePipelineEntry;
use App\Models\ExpertPoolProfile;
use App\Models\ExpertUser;
use App\Models\Interview;
use App\Models\InterviewPanelMember;
use App\Models\InterviewScorecard;
use App\Models\Organisation;
use App\Models\OrganisationUser;
use App\Models\RecruitmentAssignment;
use App\Models\TalentRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class InterviewSecurityTest extends TestCase
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

        return [$organisation, $assignment, $entry];
    }

    /** @test */
    public function a_recruiter_cannot_schedule_an_interview_on_another_recruiters_assignment(): void
    {
        $recruiterA = User::factory()->create(['role' => RsRole::Recruiter]);
        [, $assignment, $entry] = $this->makeEntry($recruiterA);

        $recruiterB = User::factory()->create(['role' => RsRole::Recruiter]);
        $tokenB = $recruiterB->createToken('admin-session')->plainTextToken;

        $this->withToken($tokenB)->postJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/interviews",
            ['type' => 'video'],
        )->assertStatus(403);
    }

    /** @test */
    public function only_an_assigned_panel_member_can_submit_a_scorecard(): void
    {
        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        [, $assignment, $entry] = $this->makeEntry($recruiter);
        $token = $recruiter->createToken('admin-session')->plainTextToken;

        $interviewRes = $this->withToken($token)->postJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/interviews",
            ['type' => 'video'],
        );
        $interviewId = $interviewRes->json('data.id');

        // Never added as a panel member — must be rejected.
        $outsider = User::factory()->create(['role' => RsRole::Recruiter]);
        $outsiderToken = $outsider->createToken('admin-session')->plainTextToken;

        Auth::forgetGuards();
        $this->withToken($outsiderToken)->postJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/interviews/{$interviewId}/scorecard",
            ['overall_recommendation' => 'yes'],
        )->assertStatus(403);
    }

    /** @test */
    public function an_organisation_cannot_see_an_interview_for_a_candidate_never_released_to_them(): void
    {
        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        [$organisation, $assignment, $entry] = $this->makeEntry($recruiter);
        $token = $recruiter->createToken('admin-session')->plainTextToken;

        $interviewRes = $this->withToken($token)->postJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/interviews",
            ['type' => 'video'],
        );
        $interviewId = $interviewRes->json('data.id');

        // The same-tenant organisation, but the candidate was never released (no DataRelease exists at all).
        Auth::forgetGuards();
        $orgUser = OrganisationUser::factory()->create(['organisation_id' => $organisation->id]);
        $orgToken = $orgUser->createToken('organisation-session')->plainTextToken;

        $this->withToken($orgToken)->getJson("/api/organisation/interviews/{$interviewId}")->assertStatus(403);
        $this->withToken($orgToken)->getJson('/api/organisation/interviews')->assertStatus(200)->assertJsonCount(0, 'data');
    }

    /** @test */
    public function a_co_panelists_scorecard_stays_hidden_until_the_interview_is_completed(): void
    {
        $recruiterA = User::factory()->create(['role' => RsRole::Recruiter]);
        [, $assignment, $entry] = $this->makeEntry($recruiterA);
        $manager = User::factory()->create(['role' => RsRole::RecruitmentManager]);

        $interview = Interview::create([
            'candidate_pipeline_entry_id' => $entry->id,
            'type' => 'panel',
            'status' => 'scheduled',
            'created_by' => $recruiterA->id,
        ]);
        InterviewPanelMember::create(['interview_id' => $interview->id, 'panelist_type' => User::class, 'panelist_id' => $recruiterA->id]);

        $recruiterB = User::factory()->create(['role' => RsRole::Recruiter]);
        InterviewPanelMember::create(['interview_id' => $interview->id, 'panelist_type' => User::class, 'panelist_id' => $recruiterB->id]);

        $tokenA = $recruiterA->createToken('admin-session')->plainTextToken;
        $this->withToken($tokenA)->postJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/interviews/{$interview->id}/scorecard",
            ['overall_recommendation' => 'yes'],
        )->assertStatus(201);

        // Recruiter B submits their own scorecard too, via the manager token (both hold InterviewManage on this assignment through different mechanisms — here we insert it directly to isolate the visibility assertion from a second HTTP round-trip's own authorization).
        InterviewScorecard::create([
            'interview_id' => $interview->id,
            'panelist_type' => User::class,
            'panelist_id' => $recruiterB->id,
            'overall_recommendation' => 'no',
            'submitted_at' => now(),
        ]);

        // Recruiter A only oversees their own assignment (not manager-tier), so viewing before completion shows only their own scorecard, never Recruiter B's.
        Auth::forgetGuards();
        $showRes = $this->withToken($tokenA)->getJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/interviews/{$interview->id}",
        );
        $showRes->assertStatus(200)->assertJsonCount(1, 'data.scorecards');

        // Recruitment Manager (oversight tier) sees both scorecards regardless of completion status.
        Auth::forgetGuards();
        $managerToken = $manager->createToken('admin-session')->plainTextToken;
        $this->withToken($managerToken)->getJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/interviews/{$interview->id}",
        )->assertStatus(200)->assertJsonCount(2, 'data.scorecards');

        // Once the interview is marked completed, Recruiter A can now see both.
        Auth::forgetGuards();
        $this->withToken($managerToken)->patchJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/interviews/{$interview->id}/status",
            ['status' => 'completed'],
        )->assertStatus(200);

        Auth::forgetGuards();
        $this->withToken($tokenA)->getJson(
            "/api/admin/recruitment-assignments/{$assignment->id}/pipeline/{$entry->id}/interviews/{$interview->id}",
        )->assertStatus(200)->assertJsonCount(2, 'data.scorecards');
    }
}
