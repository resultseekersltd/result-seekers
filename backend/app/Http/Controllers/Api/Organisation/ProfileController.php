<?php

namespace App\Http\Controllers\Api\Organisation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Organisation\UpdateProfileRequest;
use App\Http\Resources\Organisation\OrganisationResource;
use App\Models\OrganisationUser;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        /** @var OrganisationUser $user */
        $user = $request->user();

        return response()->json(['data' => new OrganisationResource($user->organisation)]);
    }

    /**
     * Partial update — deliberately excludes `status`/`verified_at`/
     * `verified_by`/`name`/`slug` (see UpdateProfileRequest), which stay
     * RS-controlled even for the organisation's own representative,
     * matching ExpertPool\ProfileController's same treatment of
     * `status`/`reviewed_by`.
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        /** @var OrganisationUser $user */
        $user = $request->user();
        $organisation = $user->organisation;

        $this->authorize('update', $organisation);

        $organisation->fill($request->validated())->save();

        AuditLogger::log('organisation.profile_updated', $organisation, $request->validated(), $user);

        return response()->json(['data' => new OrganisationResource($organisation)]);
    }
}
