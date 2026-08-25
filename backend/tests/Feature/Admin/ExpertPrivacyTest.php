<?php

namespace Tests\Feature\Admin;

use App\Enums\ExpertVisibility;
use App\Enums\RsRole;
use App\Models\ExpertPoolProfile;
use App\Models\ExpertUser;
use App\Models\Organisation;
use App\Models\OrganisationUser;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * talent-expert.txt, "CANDIDATE VISIBILITY" + "EXPERT INFORMATION
 * DISCLOSURE": private/temporarily-unavailable/archived profiles must
 * never surface in recruiter search, and the allowlist-shaped
 * ExpertSearchResult must never leak private fields (email, phone, CV
 * path, internal notes) even for profiles that ARE discoverable.
 * Also the "IMPORTANT BUSINESS RULE" from the approved Phase 1 scope:
 * organisation users must never reach the search endpoint at all.
 */
class ExpertPrivacyTest extends TestCase
{
    use RefreshDatabase;

    private function makeProfile(ExpertVisibility $visibility, array $overrides = []): ExpertPoolProfile
    {
        $expertUser = ExpertUser::factory()->create($overrides['user'] ?? []);

        return ExpertPoolProfile::create(array_merge([
            'expert_user_id' => $expertUser->id,
            'professional_title' => 'Senior Researcher',
            'country' => 'Nigeria',
            'years_experience' => 8,
            'visibility_status' => $visibility,
        ], $overrides['profile'] ?? []));
    }

    /** @test */
    public function a_private_profile_never_appears_in_recruiter_search_results(): void
    {
        $this->makeProfile(ExpertVisibility::Private);

        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        $token = $recruiter->createToken('admin-session')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/admin/recruiter-search');

        $response->assertStatus(200)->assertJsonCount(0, 'data');
    }

    /** @test */
    public function a_temporarily_unavailable_or_archived_profile_never_appears_in_search(): void
    {
        $this->makeProfile(ExpertVisibility::TemporarilyUnavailable);
        $this->makeProfile(ExpertVisibility::Archived);

        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        $token = $recruiter->createToken('admin-session')->plainTextToken;

        $this->withToken($token)->getJson('/api/admin/recruiter-search')->assertJsonCount(0, 'data');
    }

    /** @test */
    public function a_discoverable_profile_appears_but_only_through_the_allowlist_resource(): void
    {
        $profile = $this->makeProfile(
            ExpertVisibility::AnonymousMatching,
            ['user' => ['email' => 'private-expert@example.com']],
        );

        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        $token = $recruiter->createToken('admin-session')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/admin/recruiter-search');

        $response->assertStatus(200)->assertJsonCount(1, 'data');
        $response->assertJsonFragment(['professional_title' => 'Senior Researcher']);

        $raw = $response->json('data.0');
        $this->assertArrayNotHasKey('email', $raw, 'ExpertSearchResult must never expose email.');
        $this->assertArrayNotHasKey('phone', $raw, 'ExpertSearchResult must never expose phone.');
        $this->assertArrayNotHasKey('cv_path', $raw, 'ExpertSearchResult must never expose the CV path.');
        $this->assertArrayNotHasKey('bio', $raw, 'ExpertSearchResult must never expose the full bio.');
        $this->assertArrayNotHasKey('current_organization', $raw);

        unset($profile);
    }

    /** @test */
    public function organisation_users_can_never_reach_recruiter_search_at_all(): void
    {
        $this->makeProfile(ExpertVisibility::AnonymousMatching);

        $organisation = Organisation::factory()->create();
        $orgUser = OrganisationUser::factory()->create(['organisation_id' => $organisation->id]);
        $token = $orgUser->createToken('organisation-session')->plainTextToken;

        // No such route exists under /api/organisation/* at all — confirmed
        // structurally by the readiness report's discovery-model
        // correction — but also verify the admin-side endpoint itself
        // rejects an organisation token outright.
        $this->withToken($token)->getJson('/api/admin/recruiter-search')->assertStatus(403);
    }
}
