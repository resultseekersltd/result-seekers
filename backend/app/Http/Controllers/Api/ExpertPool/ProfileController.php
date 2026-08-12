<?php

namespace App\Http\Controllers\Api\ExpertPool;

use App\Enums\ExpertPoolProfileStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\ExpertPool\UpdateProfileRequest;
use App\Http\Resources\ExpertPool\ExpertPoolProfileResource;
use App\Models\ExpertDiscipline;
use App\Models\ExpertUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    /**
     * Return the authenticated expert's full profile.
     */
    public function show(Request $request): JsonResponse
    {
        /** @var ExpertUser $user */
        $user = $request->user();
        $profile = $user->profile()->with(['disciplines', 'experiences', 'education'])->firstOrFail();

        return response()->json(['data' => new ExpertPoolProfileResource($profile)]);
    }

    /**
     * Update the profile (partial PATCH — only sent fields are updated).
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        /** @var ExpertUser $user */
        $user = $request->user();
        $profile = $user->profile()->firstOrFail();

        $data = $request->safe()->except('discipline_ids');
        $profile->fill($data)->save();

        // Sync disciplines if provided.
        if ($request->has('discipline_ids')) {
            $ids = $request->input('discipline_ids', []);
            $profile->disciplines()->sync($ids);
        }

        $profile->load(['disciplines', 'experiences', 'education']);

        return response()->json(['data' => new ExpertPoolProfileResource($profile)]);
    }

    /**
     * Submit the profile for admin review (status transition: complete → submitted).
     */
    public function submit(Request $request): JsonResponse
    {
        /** @var ExpertUser $user */
        $user = $request->user();
        $profile = $user->profile()->firstOrFail();

        if (! $profile->isComplete()) {
            $missing = $profile->completion()['missing'];

            return response()->json([
                'message' => 'Profile is incomplete. Please fill in all required fields.',
                'missing' => $missing,
            ], 422);
        }

        $profile->update([
            'status' => ExpertPoolProfileStatus::Submitted,
            'submitted_at' => now(),
        ]);

        return response()->json(['message' => 'Profile submitted for review.']);
    }

    /**
     * Change the authenticated expert's password.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ]);

        /** @var ExpertUser $user */
        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->forceFill(['password' => Hash::make($request->password)])->save();

        return response()->json(['message' => 'Password updated successfully.']);
    }

    /**
     * List all expert disciplines (for the expertise selection UI).
     */
    public function disciplines(): JsonResponse
    {
        $disciplines = ExpertDiscipline::orderBy('name')->get(['id', 'name', 'slug']);

        return response()->json(['data' => $disciplines]);
    }
}
