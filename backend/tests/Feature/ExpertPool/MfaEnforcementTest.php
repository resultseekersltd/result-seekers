<?php

namespace Tests\Feature\ExpertPool;

use App\Models\ExpertRecoveryCode;
use App\Models\ExpertUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

/**
 * Regression coverage for the Expert Pool MFA-pending token bypass fixed in
 * Phase 0 (routes/api.php:124 now carries 'abilities:*', mirroring the admin
 * group). Before the fix, the restricted mfa-pending token — meant only for
 * POST /expert-pool/mfa/verify — was accepted by every other authenticated
 * expert-pool endpoint.
 */
class MfaEnforcementTest extends TestCase
{
    use RefreshDatabase;

    private const MFA_SECRET = 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD';

    /** @return array<int, array{string, string}> */
    public static function protectedEndpoints(): array
    {
        return [
            'profile show' => ['GET', '/api/expert-pool/profile'],
            'experiences index' => ['GET', '/api/expert-pool/experiences'],
            'education index' => ['GET', '/api/expert-pool/education'],
            'cv download' => ['GET', '/api/expert-pool/cv/download'],
            'me' => ['GET', '/api/expert-pool/me'],
            'mfa setup' => ['GET', '/api/expert-pool/mfa/setup'],
        ];
    }

    /** @test */
    public function mfa_pending_token_is_rejected_by_every_protected_endpoint(): void
    {
        $user = ExpertUser::factory()->withMfa(self::MFA_SECRET)->create();
        $mfaToken = $user->createToken('mfa-pending', ['mfa:verify'], now()->addMinutes(10))->plainTextToken;

        foreach (self::protectedEndpoints() as $label => [$method, $uri]) {
            $response = $this->withToken($mfaToken)->json($method, $uri);

            $this->assertSame(403, $response->status(), "Expected 403 for {$label} with an mfa-pending token, got {$response->status()}.");
        }
    }

    /** @test */
    public function mfa_pending_token_cannot_change_password(): void
    {
        $user = ExpertUser::factory()->withMfa(self::MFA_SECRET)->create();
        $mfaToken = $user->createToken('mfa-pending', ['mfa:verify'], now()->addMinutes(10))->plainTextToken;

        $response = $this->withToken($mfaToken)->postJson('/api/expert-pool/profile/change-password', [
            'current_password' => 'password',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function mfa_pending_token_can_still_reach_the_verify_endpoint_itself(): void
    {
        $user = ExpertUser::factory()->withMfa(self::MFA_SECRET)->create();
        $mfaToken = $user->createToken('mfa-pending', ['mfa:verify'], now()->addMinutes(10))->plainTextToken;

        $code = (new Google2FA)->getCurrentOtp(self::MFA_SECRET);

        $response = $this->withToken($mfaToken)->postJson('/api/expert-pool/mfa/verify', ['code' => $code]);

        $response->assertStatus(200)->assertJsonStructure(['token', 'user']);
    }

    /** @test */
    public function successful_totp_verification_upgrades_to_a_full_session_token(): void
    {
        $user = ExpertUser::factory()->withMfa(self::MFA_SECRET)->create();
        $user->profile()->create([]);

        $login = $this->postJson('/api/expert-pool/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);
        $login->assertStatus(200)->assertJson(['mfa_required' => true]);
        $mfaToken = $login->json('mfa_token');

        $code = (new Google2FA)->getCurrentOtp(self::MFA_SECRET);
        $verify = $this->withToken($mfaToken)->postJson('/api/expert-pool/mfa/verify', ['code' => $code]);
        $verify->assertStatus(200);
        $fullToken = $verify->json('token');

        // Sanctum's guard caches the resolved user per RequestGuard instance,
        // which otherwise survives across sequential test-client calls within
        // one test method — forget it so the next call re-resolves against
        // the new bearer token instead of the (now-deleted) mfa-pending one.
        Auth::forgetGuards();

        $profile = $this->withToken($fullToken)->getJson('/api/expert-pool/profile');
        $profile->assertStatus(200);

        // The spent mfa-pending token must no longer work at all.
        Auth::forgetGuards();
        $this->withToken($mfaToken)->getJson('/api/expert-pool/profile')->assertStatus(401);
    }

    /** @test */
    public function recovery_code_verification_also_upgrades_to_a_full_session_token(): void
    {
        $user = ExpertUser::factory()->withMfa(self::MFA_SECRET)->create();
        $user->profile()->create([]);

        $plainCode = 'ABCD-EFGH';
        ExpertRecoveryCode::create([
            'expert_user_id' => $user->id,
            'code_hash' => Hash::make($plainCode),
        ]);

        $mfaToken = $user->createToken('mfa-pending', ['mfa:verify'], now()->addMinutes(10))->plainTextToken;

        $verify = $this->withToken($mfaToken)->postJson('/api/expert-pool/mfa/verify', [
            'code' => $plainCode,
            'recovery_mode' => true,
        ]);
        $verify->assertStatus(200);

        Auth::forgetGuards();
        $profile = $this->withToken($verify->json('token'))->getJson('/api/expert-pool/profile');
        $profile->assertStatus(200);
    }

    /** @test */
    public function a_full_session_token_reaches_expert_pool_functionality_normally(): void
    {
        // No MFA enabled at all — the common case — must be unaffected by the fix.
        $user = ExpertUser::factory()->create();
        $user->profile()->create([]);
        $token = $user->createToken('expert-session')->plainTextToken;

        $this->withToken($token)->getJson('/api/expert-pool/profile')->assertStatus(200);
        $this->withToken($token)->getJson('/api/expert-pool/experiences')->assertStatus(200);
        $this->withToken($token)->getJson('/api/expert-pool/education')->assertStatus(200);
    }
}
