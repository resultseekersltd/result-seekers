<?php

namespace Tests\Feature\Admin;

use App\Enums\RsRole;
use App\Models\AdminRecoveryCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

/**
 * Admin-side equivalent of ExpertPool/MfaEnforcementTest.php. The admin
 * route group already applied 'abilities:*' correctly before Phase 0 — this
 * suite exists to lock that behaviour in as a regression guard, since it is
 * the reference pattern the Expert Pool fix now mirrors.
 */
class MfaEnforcementTest extends TestCase
{
    use RefreshDatabase;

    private const MFA_SECRET = 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD';

    /** @test */
    public function mfa_pending_token_is_rejected_by_protected_admin_endpoints(): void
    {
        $admin = User::factory()->withMfa(self::MFA_SECRET)->create();
        $mfaToken = $admin->createToken('mfa-pending', ['mfa:verify'], now()->addMinutes(10))->plainTextToken;

        $this->withToken($mfaToken)->getJson('/api/admin/me')->assertStatus(403);
        $this->withToken($mfaToken)->getJson('/api/admin/solutions')->assertStatus(403);
        $this->withToken($mfaToken)->postJson('/api/admin/logout')->assertStatus(403);
    }

    /** @test */
    public function mfa_pending_token_can_still_reach_the_verify_endpoint_itself(): void
    {
        $admin = User::factory()->withMfa(self::MFA_SECRET)->create();
        $mfaToken = $admin->createToken('mfa-pending', ['mfa:verify'], now()->addMinutes(10))->plainTextToken;

        $code = (new Google2FA)->getCurrentOtp(self::MFA_SECRET);
        $this->withToken($mfaToken)->postJson('/api/admin/mfa/verify', ['code' => $code])
            ->assertStatus(200)
            ->assertJsonStructure(['token', 'user']);
    }

    /** @test */
    public function successful_totp_verification_upgrades_to_a_full_admin_session(): void
    {
        $admin = User::factory()->withMfa(self::MFA_SECRET)->create();

        $login = $this->postJson('/api/admin/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);
        $login->assertStatus(200)->assertJson(['mfa_required' => true]);

        $code = (new Google2FA)->getCurrentOtp(self::MFA_SECRET);
        $verify = $this->withToken($login->json('mfa_token'))->postJson('/api/admin/mfa/verify', ['code' => $code]);
        $verify->assertStatus(200);

        Auth::forgetGuards();
        $this->withToken($verify->json('token'))->getJson('/api/admin/me')->assertStatus(200);
    }

    /** @test */
    public function recovery_code_verification_also_upgrades_to_a_full_admin_session(): void
    {
        $admin = User::factory()->withMfa(self::MFA_SECRET)->create();
        $plainCode = 'WXYZ-1234';
        AdminRecoveryCode::create([
            'user_id' => $admin->id,
            'code_hash' => Hash::make($plainCode),
        ]);

        $mfaToken = $admin->createToken('mfa-pending', ['mfa:verify'], now()->addMinutes(10))->plainTextToken;
        $verify = $this->withToken($mfaToken)->postJson('/api/admin/mfa/verify', [
            'code' => $plainCode,
            'recovery_mode' => true,
        ]);
        $verify->assertStatus(200);

        Auth::forgetGuards();
        $this->withToken($verify->json('token'))->getJson('/api/admin/me')->assertStatus(200);
    }

    /** @test */
    public function a_non_admin_user_cannot_log_in_through_the_admin_endpoint(): void
    {
        // role defaults to 'admin' (RsRole::SuperAdmin) in the factory —
        // explicitly override to a real, non-super-admin RS role (Phase 1)
        // to confirm AuthController::login()'s ->where('role', 'admin')
        // filter still rejects every other valid role.
        $user = User::factory()->create(['role' => RsRole::Recruiter]);

        $this->postJson('/api/admin/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertStatus(401);
    }
}
