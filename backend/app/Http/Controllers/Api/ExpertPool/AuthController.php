<?php

namespace App\Http\Controllers\Api\ExpertPool;

use App\Http\Controllers\Controller;
use App\Http\Requests\ExpertPool\LoginRequest;
use App\Http\Requests\ExpertPool\RegisterRequest;
use App\Http\Resources\ExpertPool\ExpertUserResource;
use App\Models\ExpertPoolProfile;
use App\Models\ExpertUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Register a new expert account.
     * Creates the user and an empty profile, then fires the email
     * verification notification so the user can verify before logging in.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = ExpertUser::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password, // cast: 'hashed' handles bcrypt
        ]);

        // Create a blank profile so profile endpoints always find one.
        ExpertPoolProfile::create(['expert_user_id' => $user->id]);

        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Registration successful. Please check your email to verify your account.',
        ], 201);
    }

    /**
     * Authenticate an expert.
     * - Returns 403 if the account is inactive.
     * - Returns 403 if email is not verified.
     * - Returns a partial mfa_pending response if MFA is enabled —
     *   the frontend must follow up on /expert-pool/mfa/verify.
     * - Returns a full token + user on success.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = ExpertUser::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'This account has been suspended.'], 403);
        }

        if (! $user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Please verify your email address before logging in.',
                'email_unverified' => true,
            ], 403);
        }

        if ($user->mfa_enabled) {
            // Issue a short-lived, ability-restricted token for MFA challenge.
            $mfaToken = $user->createToken('mfa-pending', ['mfa:verify'], now()->addMinutes(10))->plainTextToken;

            return response()->json([
                'mfa_required' => true,
                'mfa_token' => $mfaToken,
            ], 200);
        }

        $token = $user->createToken('expert-session')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new ExpertUserResource($user),
        ]);
    }

    /**
     * Revoke the current token (logout).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    /**
     * Return the authenticated expert's account details.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => new ExpertUserResource($request->user())]);
    }

    /**
     * Resend the email verification notification.
     */
    public function resendVerification(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        $user = ExpertUser::where('email', $request->email)->first();

        if (! $user) {
            // Return success anyway to avoid email enumeration.
            return response()->json(['message' => 'If that email is registered, a verification link has been sent.']);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email is already verified.']);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verification email resent.']);
    }
}
