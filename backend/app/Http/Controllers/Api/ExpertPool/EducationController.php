<?php

namespace App\Http\Controllers\Api\ExpertPool;

use App\Http\Controllers\Controller;
use App\Http\Requests\ExpertPool\StoreEducationRequest;
use App\Http\Requests\ExpertPool\UpdateEducationRequest;
use App\Http\Resources\ExpertPool\ExpertEducationResource;
use App\Models\ExpertEducation;
use App\Models\ExpertUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EducationController extends Controller
{
    /** List the expert's own education entries. */
    public function index(Request $request): JsonResponse
    {
        /** @var ExpertUser $user */
        $user = $request->user();
        $profile = $user->profile()->firstOrFail();
        $education = $profile->education()->get();

        return response()->json(['data' => ExpertEducationResource::collection($education)]);
    }

    /** Add a new education entry. */
    public function store(StoreEducationRequest $request): JsonResponse
    {
        /** @var ExpertUser $user */
        $user = $request->user();
        $profile = $user->profile()->firstOrFail();

        $entry = $profile->education()->create($request->validated());

        return response()->json(['data' => new ExpertEducationResource($entry)], 201);
    }

    /** Update an education entry — expert must own the profile it belongs to. */
    public function update(UpdateEducationRequest $request, int $id): JsonResponse
    {
        $entry = $this->findOwnedEntry($request, $id);

        if ($entry instanceof JsonResponse) {
            return $entry;
        }

        $entry->update($request->validated());

        return response()->json(['data' => new ExpertEducationResource($entry)]);
    }

    /** Delete an education entry. */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $entry = $this->findOwnedEntry($request, $id);

        if ($entry instanceof JsonResponse) {
            return $entry;
        }

        $entry->delete();

        return response()->json(['message' => 'Education entry deleted.']);
    }

    private function findOwnedEntry(Request $request, int $id): ExpertEducation|JsonResponse
    {
        /** @var ExpertUser $user */
        $user = $request->user();
        $profile = $user->profile()->firstOrFail();

        $entry = ExpertEducation::find($id);

        if (! $entry || $entry->expert_pool_profile_id !== $profile->id) {
            return response()->json(['message' => 'Education entry not found.'], 404);
        }

        return $entry;
    }
}
