<?php

namespace App\Http\Controllers\Api\Organisation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Organisation\MfaConfirmRequest;
use App\Http\Requests\Organisation\MfaVerifyRequest;
use App\Http\Resources\Organisation\OrganisationUserResource;
use App\Models\OrganisationRecoveryCode;
use App\Models\OrganisationUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

/**
 * Exact mirror of Api\ExpertPool\MfaController / Api\Admin\AuthController's
 * MFA methods — the abilities:* gate on the authenticated Organisation
 * route group (applied from the first commit, per the Phase 0 lesson)
 * means the mfa-pending token this issues cannot reach anything except
 * verify() below.
 */
class MfaController extends Controller
{
    private Google2FA $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA;
    }

    public function setup(Request $request): JsonResponse
    {
        /** @var OrganisationUser $user */
        $user = $request->user();

        $secret = $this->google2fa->generateSecretKey();
        $user->forceFill(['mfa_secret' => $secret])->save();

        $qrUrl = $this->google2fa->getQRCodeUrl(config('app.name').' Organisation', $user->email, $secret);

        return response()->json(['secret' => $secret, 'qr_url' => $qrUrl]);
    }

    public function confirm(MfaConfirmRequest $request): JsonResponse
    {
        /** @var OrganisationUser $user */
        $user = $request->user();

        if (! $user->mfa_secret) {
            return response()->json(['message' => 'No MFA setup in progress. Call /mfa/setup first.'], 422);
        }

        if (! $this->google2fa->verifyKey($user->mfa_secret, $request->code)) {
            return response()->json(['message' => 'Invalid code. Please try again.'], 422);
        }

        $user->forceFill(['mfa_enabled' => true])->save();

        return response()->json([
            'message' => 'MFA enabled successfully.',
            'recovery_codes' => $this->generateRecoveryCodes($user),
        ]);
    }

    public function verify(MfaVerifyRequest $request): JsonResponse
    {
        /** @var OrganisationUser $user */
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
        $token = $user->createToken('organisation-session')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new OrganisationUserResource($user),
        ]);
    }

    public function disable(Request $request): JsonResponse
    {
        $request->validate(['password' => ['required', 'string']]);

        /** @var OrganisationUser $user */
        $user = $request->user();

        if (! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Incorrect password.'], 403);
        }

        $user->forceFill(['mfa_enabled' => false, 'mfa_secret' => null])->save();
        $user->recoveryCodes()->delete();

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

        /** @var OrganisationUser $user */
        $user = $request->user();

        if (! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Incorrect password.'], 403);
        }

        $user->recoveryCodes()->delete();

        return response()->json([
            'message' => 'Recovery codes regenerated.',
            'recovery_codes' => $this->generateRecoveryCodes($user),
        ]);
    }

    /** @return list<string> */
    private function generateRecoveryCodes(OrganisationUser $user): array
    {
        $codes = [];

        for ($i = 0; $i < 8; $i++) {
            $code = strtoupper(Str::random(4).'-'.Str::random(4));
            $codes[] = $code;

            OrganisationRecoveryCode::create([
                'organisation_user_id' => $user->id,
                'code_hash' => Hash::make($code),
            ]);
        }

        return $codes;
    }

    private function verifyRecoveryCode(OrganisationUser $user, string $code): bool
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
