<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\LoginRequest;
use App\Http\Requests\Admin\MfaConfirmRequest;
use App\Http\Requests\Admin\MfaVerifyRequest;
use App\Http\Resources\Admin\AdminUserResource;
use App\Models\AdminRecoveryCode;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

/**
 * Admin login + MFA, mirroring Api\ExpertPool\AuthController +
 * MfaController exactly. No self-registration — admin accounts are only
 * created via `php artisan admin:create` (see Console\Commands\CreateAdminCommand).
 */
class AuthController extends Controller
{
    private Google2FA $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA;
    }

    /**
     * Authenticate an admin.
     * - Rejects non-admin / inactive accounts.
     * - Every admin has MFA (mandatory) — always returns mfa_required.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->where('role', 'admin')->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'This account has been suspended.'], 403);
        }

        if (! $user->mfa_enabled) {
            // First-ever login: issue a full token so the admin can complete
            // mandatory MFA setup (mfa/setup + mfa/confirm), same shape as a
            // normal session — setup itself is gated behind the dashboard.
            $token = $user->createToken('admin-session')->plainTextToken;
            // This route has no auth:sanctum middleware (it's the login
            // endpoint), so request()->user() is null here — pass the actor
            // explicitly rather than logging an anonymous login.
            AuditLogger::log('admin.login', $user, [], $user);

            return response()->json([
                'token' => $token,
                'user' => new AdminUserResource($user),
                'mfa_setup_required' => true,
            ]);
        }

        $mfaToken = $user->createToken('mfa-pending', ['mfa:verify'], now()->addMinutes(10))->plainTextToken;

        return response()->json([
            'mfa_required' => true,
            'mfa_token' => $mfaToken,
        ]);
    }

    /**
     * Verify a TOTP code (or recovery code) during the login MFA challenge.
     */
    public function mfaVerify(MfaVerifyRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user->currentAccessToken()->can('mfa:verify')) {
            return response()->json(['message' => 'Invalid token type for MFA verification.'], 403);
        }

        $verified = $request->boolean('recovery_mode')
            ? $this->verifyRecoveryCode($user, $request->code)
            : $this->google2fa->verifyKey($user->mfa_secret, $request->code);

        if (! $verified) {
            return response()->json(['message' => 'Invalid code.'], 422);
        }

        $user->currentAccessToken()->delete();
        $token = $user->createToken('admin-session')->plainTextToken;
        AuditLogger::log('admin.login', $user);

        return response()->json([
            'token' => $token,
            'user' => new AdminUserResource($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        AuditLogger::log('admin.logout', $request->user());
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => new AdminUserResource($request->user())]);
    }

    /** Mirrors Api\ExpertPool\ProfileController::changePassword(), with a stronger minimum matching admin:create's own rule. */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:12', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ]);

        /** @var User $user */
        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->forceFill(['password' => $request->password])->save();
        AuditLogger::log('admin.password_changed', $user);

        return response()->json(['message' => 'Password updated successfully.']);
    }

    /**
     * Generate and return a new TOTP secret + QR code URL (not saved as
     * enabled until confirm()).
     */
    public function mfaSetup(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $secret = $this->google2fa->generateSecretKey();
        $user->forceFill(['mfa_secret' => $secret])->save();

        $qrUrl = $this->google2fa->getQRCodeUrl(config('app.name').' Admin', $user->email, $secret);

        return response()->json(['secret' => $secret, 'qr_url' => $qrUrl]);
    }

    /**
     * Confirm MFA setup and generate recovery codes. Mandatory step before
     * the admin dashboard is usable.
     */
    public function mfaConfirm(MfaConfirmRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user->mfa_secret) {
            return response()->json(['message' => 'No MFA setup in progress. Call /mfa/setup first.'], 422);
        }

        if (! $this->google2fa->verifyKey($user->mfa_secret, $request->code)) {
            return response()->json(['message' => 'Invalid code. Please try again.'], 422);
        }

        $user->forceFill(['mfa_enabled' => true])->save();
        AuditLogger::log('admin.mfa_enabled', $user);

        return response()->json([
            'message' => 'MFA enabled successfully.',
            'recovery_codes' => $this->generateRecoveryCodes($user),
        ]);
    }

    /**
     * Disable MFA. Requires password confirmation. Note: MFA is mandatory
     * for admin accounts — disabling it here only clears the current
     * secret so mfa/setup can issue a fresh one; the dashboard should
     * treat mfa_enabled=false as "setup required", not "optional".
     */
    public function mfaDisable(Request $request): JsonResponse
    {
        $request->validate(['password' => ['required', 'string']]);

        /** @var User $user */
        $user = $request->user();

        if (! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Incorrect password.'], 403);
        }

        $user->forceFill(['mfa_enabled' => false, 'mfa_secret' => null])->save();
        $user->recoveryCodes()->delete();
        AuditLogger::log('admin.mfa_disabled', $user);

        return response()->json(['message' => 'MFA disabled. You must set it up again before your next full session.']);
    }

    public function recoveryCodes(Request $request): JsonResponse
    {
        $unused = $request->user()->recoveryCodes()->whereNull('used_at')->count();

        return response()->json(['unused_recovery_codes' => $unused]);
    }

    public function regenerateRecoveryCodes(Request $request): JsonResponse
    {
        $request->validate(['password' => ['required', 'string']]);

        /** @var User $user */
        $user = $request->user();

        if (! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Incorrect password.'], 403);
        }

        $user->recoveryCodes()->delete();
        AuditLogger::log('admin.mfa_recovery_codes_regenerated', $user);

        return response()->json([
            'message' => 'Recovery codes regenerated.',
            'recovery_codes' => $this->generateRecoveryCodes($user),
        ]);
    }

    /** @return list<string> */
    private function generateRecoveryCodes(User $user): array
    {
        $codes = [];

        for ($i = 0; $i < 8; $i++) {
            $code = strtoupper(Str::random(4).'-'.Str::random(4));
            $codes[] = $code;

            AdminRecoveryCode::create([
                'user_id' => $user->id,
                'code_hash' => Hash::make($code),
            ]);
        }

        return $codes;
    }

    private function verifyRecoveryCode(User $user, string $code): bool
    {
        foreach ($user->recoveryCodes()->whereNull('used_at')->get() as $recovery) {
            if (Hash::check($code, $recovery->code_hash)) {
                $recovery->update(['used_at' => now()]);

                return true;
            }
        }

        return false;
    }
}
