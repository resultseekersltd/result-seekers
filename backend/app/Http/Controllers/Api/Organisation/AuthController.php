<?php

namespace App\Http\Controllers\Api\Organisation;

use App\Enums\OrganisationRole;
use App\Enums\OrganisationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Organisation\LoginRequest;
use App\Http\Requests\Organisation\RegisterRequest;
use App\Http\Resources\Organisation\OrganisationUserResource;
use App\Models\Organisation;
use App\Models\OrganisationUser;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Mirrors Api\ExpertPool\AuthController's shape exactly (register → verify
 * email → login → optional MFA → session), extended with the organisation
 * side of self-registration: creates both the Organisation (status =
 * PendingVerification, never auto-verified) and its first Organisation
 * Representative user in one step, per the approved Phase 1 scope
 * ("Self-registration with a verification gate").
 */
class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $organisation = Organisation::create([
            'name' => $request->organisation_name,
            'slug' => Str::slug($request->organisation_name).'-'.Str::lower(Str::random(6)),
            'legal_name' => $request->legal_name,
            'organisation_type' => $request->organisation_type,
            'sector' => $request->sector,
            'country' => $request->country,
            'state' => $request->state,
            'registered_address' => $request->registered_address,
            'website' => $request->website,
            'registration_number' => $request->registration_number,
            'contact_person_name' => $request->contact_name,
            'contact_person_position' => $request->contact_position,
            'contact_person_phone' => $request->contact_phone,
            'profile_description' => $request->profile_description,
            'recruitment_needs' => $request->recruitment_needs,
            'terms_agreed' => true,
            'terms_agreed_at' => now(),
            'status' => OrganisationStatus::PendingVerification,
        ]);

        $user = OrganisationUser::create([
            'organisation_id' => $organisation->id,
            'name' => $request->contact_name,
            'email' => $request->email,
            'password' => $request->password,
            'role' => OrganisationRole::Representative,
        ]);

        $user->sendEmailVerificationNotification();

        AuditLogger::log('organisation.registered', $organisation, [], $user);

        return response()->json([
            'message' => 'Registration successful. Please check your email to verify your account. Your organisation is now pending Result Seekers verification.',
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = OrganisationUser::where('email', $request->email)->first();

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
            $mfaToken = $user->createToken('mfa-pending', ['mfa:verify'], now()->addMinutes(10))->plainTextToken;

            return response()->json([
                'mfa_required' => true,
                'mfa_token' => $mfaToken,
            ], 200);
        }

        // MFA is mandatory for organisation accounts (approved Phase 1 scope),
        // same treatment as admin: first login without mfa_enabled issues a
        // full token so the user can complete mandatory setup.
        $token = $user->createToken('organisation-session')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new OrganisationUserResource($user),
            'mfa_setup_required' => true,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => new OrganisationUserResource($request->user())]);
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        $user = OrganisationUser::where('email', $request->email)->first();

        if (! $user) {
            return response()->json(['message' => 'If that email is registered, a verification link has been sent.']);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email is already verified.']);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verification email resent.']);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ]);

        /** @var OrganisationUser $user */
        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->forceFill(['password' => Hash::make($request->password)])->save();

        return response()->json(['message' => 'Password updated successfully.']);
    }
}
