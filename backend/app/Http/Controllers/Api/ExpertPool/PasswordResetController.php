<?php

namespace App\Http\Controllers\Api\ExpertPool;

use App\Http\Controllers\Controller;
use App\Models\ExpertUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class PasswordResetController extends Controller
{
    /**
     * Send a password reset link to the given email.
     * Returns a vague success message even if the email is not found
     * to prevent email enumeration.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        Password::broker('expert_users')->sendResetLink(
            $request->only('email')
        );

        return response()->json([
            'message' => 'If that email is registered, a password reset link has been sent.',
        ]);
    }

    /**
     * Reset the password using the token from the email.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ]);

        $status = Password::broker('expert_users')->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (ExpertUser $user, string $password) {
                $user->forceFill(['password' => Hash::make($password)])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Password reset successfully. You may now log in.']);
        }

        return response()->json([
            'message' => match ($status) {
                Password::INVALID_TOKEN => 'This password reset link is invalid or has expired.',
                Password::INVALID_USER => 'We could not find an account with that email address.',
                default => 'Unable to reset password. Please try again.',
            },
        ], 422);
    }
}
