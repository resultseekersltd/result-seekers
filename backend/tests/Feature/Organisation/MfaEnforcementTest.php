<?php

namespace Tests\Feature\Organisation;

use App\Models\Organisation;
use App\Models\OrganisationRecoveryCode;
use App\Models\OrganisationUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

/**
 * Third copy of the Phase 0 MFA-enforcement pattern (ExpertPool, Admin) —
 * the abilities:* gate is applied to the Organisation route group from the
 * very first commit here, not retrofitted after a bypass was found, which
 * is the direct lesson Phase 0 established.
 */
class MfaEnforcementTest extends TestCase
{
    use RefreshDatabase;

    private const MFA_SECRET = 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD';

    /** @return array<int, array{string, string}> */
    public static function protectedEndpoints(): array
    {
        return [
            'profile show' => ['GET', '/api/organisation/profile'],
            'users index' => ['GET', '/api/organisation/users'],
            'talent-requests index' => ['GET', '/api/organisation/talent-requests'],
            'me' => ['GET', '/api/organisation/me'],
            'mfa setup' => ['GET', '/api/organisation/mfa/setup'],
        ];
    }

    /** @test */
    public function mfa_pending_token_is_rejected_by_every_protected_endpoint(): void
    {
        $user = OrganisationUser::factory()->withMfa(self::MFA_SECRET)->create();
        $mfaToken = $user->createToken('mfa-pending', ['mfa:verify'], now()->addMinutes(10))->plainTextToken;

        foreach (self::protectedEndpoints() as $label => [$method, $uri]) {
            $response = $this->withToken($mfaToken)->json($method, $uri);
            $this->assertSame(403, $response->status(), "Expected 403 for {$label} with an mfa-pending token, got {$response->status()}.");
        }
    }

    /** @test */
    public function mfa_pending_token_can_still_reach_the_verify_endpoint_itself(): void
    {
        $user = OrganisationUser::factory()->withMfa(self::MFA_SECRET)->create();
        $mfaToken = $user->createToken('mfa-pending', ['mfa:verify'], now()->addMinutes(10))->plainTextToken;

        $code = (new Google2FA)->getCurrentOtp(self::MFA_SECRET);
        $this->withToken($mfaToken)->postJson('/api/organisation/mfa/verify', ['code' => $code])
            ->assertStatus(200)
            ->assertJsonStructure(['token', 'user']);
    }

    /** @test */
    public function successful_totp_verification_upgrades_to_a_full_session(): void
    {
        $organisation = Organisation::factory()->create();
        $user = OrganisationUser::factory()->withMfa(self::MFA_SECRET)->create(['organisation_id' => $organisation->id]);

        $login = $this->postJson('/api/organisation/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);
        $login->assertStatus(200)->assertJson(['mfa_required' => true]);

        $code = (new Google2FA)->getCurrentOtp(self::MFA_SECRET);
        $verify = $this->withToken($login->json('mfa_token'))->postJson('/api/organisation/mfa/verify', ['code' => $code]);
        $verify->assertStatus(200);

        Auth::forgetGuards();
        $this->withToken($verify->json('token'))->getJson('/api/organisation/me')->assertStatus(200);
    }

    /** @test */
    public function recovery_code_verification_also_upgrades_to_a_full_session(): void
    {
        $user = OrganisationUser::factory()->withMfa(self::MFA_SECRET)->create();
        $plainCode = 'ABCD-EFGH';
        OrganisationRecoveryCode::create([
            'organisation_user_id' => $user->id,
            'code_hash' => Hash::make($plainCode),
        ]);

        $mfaToken = $user->createToken('mfa-pending', ['mfa:verify'], now()->addMinutes(10))->plainTextToken;
        $verify = $this->withToken($mfaToken)->postJson('/api/organisation/mfa/verify', [
            'code' => $plainCode,
            'recovery_mode' => true,
        ]);
        $verify->assertStatus(200);

        Auth::forgetGuards();
        $this->withToken($verify->json('token'))->getJson('/api/organisation/me')->assertStatus(200);
    }

    /** @test */
    public function a_full_session_token_reaches_organisation_functionality_normally_before_mfa_setup(): void
    {
        // Mirrors the admin pattern: first login without mfa_enabled issues
        // a full token so the user can complete mandatory MFA setup.
        $user = OrganisationUser::factory()->create();
        $token = $user->createToken('organisation-session')->plainTextToken;

        $this->withToken($token)->getJson('/api/organisation/me')->assertStatus(200);
        $this->withToken($token)->getJson('/api/organisation/profile')->assertStatus(200);
    }
}
