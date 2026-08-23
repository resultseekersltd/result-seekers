<?php

namespace Tests\Feature\Phase3;

use App\Enums\RsRole;
use App\Models\ExpertPoolProfile;
use App\Models\ExpertUser;
use App\Models\OrganisationUser;
use App\Models\User;
use App\Models\VerificationCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class VerificationExtensionTest extends TestCase
{
    use RefreshDatabase;

    private function makeProfile(): ExpertPoolProfile
    {
        $expertUser = ExpertUser::factory()->create();

        return ExpertPoolProfile::create([
            'expert_user_id' => $expertUser->id,
            'professional_title' => 'Data Analyst',
            'country' => 'Nigeria',
        ]);
    }

    /** @test */
    public function a_recruiter_can_open_a_verification_case_but_a_verifier_cannot(): void
    {
        $profile = $this->makeProfile();

        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        $token = $recruiter->createToken('admin-session')->plainTextToken;

        $this->withToken($token)->postJson('/api/admin/verification-cases', [
            'expert_pool_profile_id' => $profile->id,
        ])->assertStatus(201);

        Auth::forgetGuards();
        $verifier = User::factory()->create(['role' => RsRole::Verifier]);
        $verifierToken = $verifier->createToken('admin-session')->plainTextToken;

        $this->withToken($verifierToken)->postJson('/api/admin/verification-cases', [
            'expert_pool_profile_id' => $profile->id,
        ])->assertStatus(403);
    }

    /** @test */
    public function a_recruiter_cannot_approve_a_verification_check(): void
    {
        $profile = $this->makeProfile();
        $case = VerificationCase::create(['expert_pool_profile_id' => $profile->id, 'status' => 'not_started']);

        $recruiter = User::factory()->create(['role' => RsRole::Recruiter]);
        $token = $recruiter->createToken('admin-session')->plainTextToken;

        $checkRes = $this->withToken($token)->postJson("/api/admin/verification-cases/{$case->id}/checks", [
            'check_type' => 'identity',
        ]);
        $checkRes->assertStatus(201);
        $checkId = collect($checkRes->json('data.checks'))->first()['id'];

        // Recruiter holds VerificationCaseManage but not VerificationApprove/VerificationReview.
        $this->withToken($token)->patchJson("/api/admin/verification-cases/{$case->id}/checks/{$checkId}", [
            'status' => 'verified',
        ])->assertStatus(403);
    }

    /** @test */
    public function verification_evidence_and_internal_notes_never_reach_organisation_or_expert_pool_routes(): void
    {
        // No organisation or expert-pool controller exposes VerificationCase/VerificationCheck at all —
        // confirmed by the absence of any such route (checked directly against the registered route list).
        $routes = collect(app('router')->getRoutes())->map(fn ($r) => $r->uri());

        $this->assertTrue($routes->contains(fn ($uri) => str_starts_with($uri, 'api/admin/verification-cases')));
        $this->assertFalse($routes->contains(fn ($uri) => str_contains($uri, 'organisation') && str_contains($uri, 'verification')));
        $this->assertFalse($routes->contains(fn ($uri) => str_contains($uri, 'expert-pool') && str_contains($uri, 'verification')));
    }

    /** @test */
    public function an_organisation_token_cannot_reach_verification_case_routes(): void
    {
        $profile = $this->makeProfile();
        $case = VerificationCase::create(['expert_pool_profile_id' => $profile->id, 'status' => 'not_started']);

        $orgUser = OrganisationUser::factory()->create();
        $token = $orgUser->createToken('organisation-session')->plainTextToken;

        $this->withToken($token)->getJson("/api/admin/verification-cases/{$case->id}")->assertStatus(403);
    }

    /** @test */
    public function an_expert_token_cannot_reach_verification_case_routes(): void
    {
        $profile = $this->makeProfile();
        $case = VerificationCase::create(['expert_pool_profile_id' => $profile->id, 'status' => 'not_started']);

        $expertUser = ExpertUser::factory()->create();
        $token = $expertUser->createToken('expert-session')->plainTextToken;

        $this->withToken($token)->getJson("/api/admin/verification-cases/{$case->id}")->assertStatus(403);
    }
}
