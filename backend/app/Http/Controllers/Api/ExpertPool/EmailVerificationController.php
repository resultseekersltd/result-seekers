<?php

namespace App\Http\Controllers\Api\ExpertPool;

use App\Http\Controllers\Controller;
use App\Models\ExpertUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class EmailVerificationController extends Controller
{
    /**
     * Mark the expert's email as verified.
     * Accepts id + hash + expires + signature query parameters generated
     * by ExpertVerifyEmail notification.
     */
    public function verify(Request $request, int $id, string $hash): JsonResponse
    {
        $user = ExpertUser::findOrFail($id);

        // Validate the signed URL.
        if (! URL::hasValidSignature($request)) {
            return response()->json(['message' => 'Invalid or expired verification link.'], 422);
        }

        // Validate that the hash matches the email.
        if (! hash_equals($hash, sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Invalid verification link.'], 403);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.']);
        }

        $user->markEmailAsVerified();

        return response()->json(['message' => 'Email verified successfully. You may now log in.']);
    }
}
