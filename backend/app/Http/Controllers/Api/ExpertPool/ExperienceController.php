<?php

namespace App\Http\Controllers\Api\ExpertPool;

use App\Http\Controllers\Controller;
use App\Http\Requests\ExpertPool\StoreExperienceRequest;
use App\Http\Requests\ExpertPool\UpdateExperienceRequest;
use App\Http\Resources\ExpertPool\ExpertExperienceResource;
use App\Models\ExpertExperience;
use App\Models\ExpertUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExperienceController extends Controller
{
    /** List the expert's own experience entries. */
    public function index(Request $request): JsonResponse
    {
        /** @var ExpertUser $user */
        $user = $request->user();
        $profile = $user->profile()->firstOrFail();
        $experiences = $profile->experiences()->get();

        return response()->json(['data' => ExpertExperienceResource::collection($experiences)]);
    }

    /** Add a new experience entry. */
    public function store(StoreExperienceRequest $request): JsonResponse
    {
        /** @var ExpertUser $user */
        $user = $request->user();
        $profile = $user->profile()->firstOrFail();

        $experience = $profile->experiences()->create($request->validated());

        return response()->json(['data' => new ExpertExperienceResource($experience)], 201);
    }

    /** Update an experience entry — expert must own the profile it belongs to. */
    public function update(UpdateExperienceRequest $request, int $id): JsonResponse
    {
        $experience = $this->findOwnedExperience($request, $id);

        if ($experience instanceof JsonResponse) {
            return $experience;
        }

        $experience->update($request->validated());

        return response()->json(['data' => new ExpertExperienceResource($experience)]);
    }

    /** Delete an experience entry. */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $experience = $this->findOwnedExperience($request, $id);

        if ($experience instanceof JsonResponse) {
            return $experience;
        }

        $experience->delete();

        return response()->json(['message' => 'Experience entry deleted.']);
    }

    /** Resolve and authorise ownership in one place. */
    private function findOwnedExperience(Request $request, int $id): ExpertExperience|JsonResponse
    {
        /** @var ExpertUser $user */
        $user = $request->user();
        $profile = $user->profile()->firstOrFail();

        $experience = ExpertExperience::find($id);

        if (! $experience || $experience->expert_pool_profile_id !== $profile->id) {
            return response()->json(['message' => 'Experience entry not found.'], 404);
        }

        return $experience;
    }
}
