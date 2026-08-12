<?php

namespace App\Http\Controllers\Api\ExpertPool;

use App\Http\Controllers\Controller;
use App\Http\Requests\ExpertPool\MfaConfirmRequest;
use App\Http\Requests\ExpertPool\MfaVerifyRequest;
use App\Http\Resources\ExpertPool\ExpertUserResource;
use App\Models\ExpertRecoveryCode;
use App\Models\ExpertUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

class MfaController extends Controller
{
    private Google2FA $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA;
    }

    /**
     * Generate and return a new TOTP secret + QR code URL.
     * The secret is not saved yet — that only happens on confirm().
     */
    public function setup(Request $request): JsonResponse
    {
        /** @var ExpertUser $user */
        $user = $request->user();

        $secret = $this->google2fa->generateSecretKey();

        // Store temporarily in the session-equivalent: a short-lived token claim.
        // We actually store it on the user (not yet confirmed), then wipe it if
        // the user never confirms, or mark mfa_enabled = true on confirm.
        // We save the pending secret so the QR code survives page refresh.
        $user->forceFill(['mfa_secret' => $secret])->save();

        $qrUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        return response()->json([
            'secret' => $secret,
            'qr_url' => $qrUrl,
        ]);
    }

    /**
     * Confirm MFA setup: validate the first TOTP code, then mark MFA enabled.
     * Generates and returns 8 one-time recovery codes.
     */
    public function confirm(MfaConfirmRequest $request): JsonResponse
    {
        /** @var ExpertUser $user */
        $user = $request->user();

        if (! $user->mfa_secret) {
            return response()->json(['message' => 'No MFA setup in progress. Call /mfa/setup first.'], 422);
        }

        $valid = $this->google2fa->verifyKey($user->mfa_secret, $request->code);

        if (! $valid) {
            return response()->json(['message' => 'Invalid code. Please try again.'], 422);
        }

        $user->forceFill(['mfa_enabled' => true])->save();

        // Generate 8 fresh recovery codes.
        $recoveryCodes = $this->generateRecoveryCodes($user);

        return response()->json([
            'message' => 'MFA enabled successfully.',
            'recovery_codes' => $recoveryCodes, // Plaintext shown once only.
        ]);
    }

    /**
     * Verify a TOTP code (or recovery code) during the login MFA challenge.
     * Accepts a mfa-pending token (ability: mfa:verify), then exchanges it
     * for a full session token on success.
     */
    public function verify(MfaVerifyRequest $request): JsonResponse
    {
        /** @var ExpertUser $user */
        $user = $request->user();

        // Ensure this token was issued as an mfa-pending token.
        if (! $user->currentAccessToken()->can('mfa:verify')) {
            return response()->json(['message' => 'Invalid token type for MFA verification.'], 403);
        }

        $verified = false;

        if ($request->boolean('recovery_mode')) {
            $verified = $this->verifyRecoveryCode($user, $request->code);
        } else {
            if (! $user->mfa_secret) {
                return response()->json(['message' => 'MFA is not configured on this account.'], 422);
            }
            $verified = $this->google2fa->verifyKey($user->mfa_secret, $request->code);
        }

        if (! $verified) {
            return response()->json(['message' => 'Invalid code.'], 422);
        }

        // Revoke the limited mfa-pending token and issue a full session token.
        $user->currentAccessToken()->delete();
        $token = $user->createToken('expert-session')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new ExpertUserResource($user),
        ]);
    }

    /**
     * Disable MFA. Requires password confirmation for security.
     */
    public function disable(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        /** @var ExpertUser $user */
        $user = $request->user();

        if (! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Incorrect password.'], 403);
        }

        $user->forceFill([
            'mfa_enabled' => false,
            'mfa_secret' => null,
        ])->save();

        // Delete all recovery codes.
        $user->recoveryCodes()->delete();

        return response()->json(['message' => 'MFA disabled successfully.']);
    }

    /**
     * Return unused recovery code count (not the codes themselves).
     */
    public function recoveryCodes(Request $request): JsonResponse
    {
        /** @var ExpertUser $user */
        $user = $request->user();

        $unused = $user->recoveryCodes()->whereNull('used_at')->count();

        return response()->json(['unused_recovery_codes' => $unused]);
    }

    /**
     * Regenerate recovery codes. Old codes are deleted.
     */
    public function regenerateRecoveryCodes(Request $request): JsonResponse
    {
        $request->validate(['password' => ['required', 'string']]);

        /** @var ExpertUser $user */
        $user = $request->user();

        if (! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Incorrect password.'], 403);
        }

        if (! $user->mfa_enabled) {
            return response()->json(['message' => 'MFA is not enabled on this account.'], 422);
        }

        $user->recoveryCodes()->delete();
        $recoveryCodes = $this->generateRecoveryCodes($user);

        return response()->json([
            'message' => 'Recovery codes regenerated.',
            'recovery_codes' => $recoveryCodes,
        ]);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Generate 8 random recovery codes, store hashed versions, return plaintext.
     *
     * @return list<string>
     */
    private function generateRecoveryCodes(ExpertUser $user): array
    {
        $codes = [];

        for ($i = 0; $i < 8; $i++) {
            $code = strtoupper(Str::random(4).'-'.Str::random(4));
            $codes[] = $code;

            ExpertRecoveryCode::create([
                'expert_user_id' => $user->id,
                'code_hash' => Hash::make($code),
            ]);
        }

        return $codes;
    }

    /**
     * Verify a recovery code against hashed codes, marking it used if valid.
     */
    private function verifyRecoveryCode(ExpertUser $user, string $code): bool
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
