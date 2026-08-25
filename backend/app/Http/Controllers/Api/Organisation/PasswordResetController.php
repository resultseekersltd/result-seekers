<?php

namespace App\Http\Controllers\Api\Organisation;

use App\Http\Controllers\Controller;
use App\Models\OrganisationUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class PasswordResetController extends Controller
{
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        Password::broker('organisation_users')->sendResetLink(
            $request->only('email')
        );

        return response()->json([
            'message' => 'If that email is registered, a password reset link has been sent.',
        ]);
    }

    /**
     * Reset the password using the token from the email. Unlike the
     * ExpertPool copy of this endpoint (kept as-is, out of Phase 1 scope),
     * this collapses the invalid-token and invalid-user outcomes into one
     * generic message — Laravel's PasswordBroker resolves the user by
     * email before checking the token, so distinguishing the two messages
     * lets an attacker confirm whether an email is registered by
     * submitting any garbage token (flagged in the earlier security
     * audit). New code, so fixed here rather than reproduced.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ]);

        $status = Password::broker('organisation_users')->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (OrganisationUser $user, string $password) {
                $user->forceFill(['password' => Hash::make($password)])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Password reset successfully. You may now log in.']);
        }

        return response()->json([
            'message' => 'This password reset link is invalid or has expired.',
        ], 422);
    }
}
