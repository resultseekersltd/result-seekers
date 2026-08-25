<?php

namespace App\Http\Controllers\Api\Organisation;

use App\Enums\OrganisationRole;
use App\Http\Controllers\Concerns\HasPaginatedResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Organisation\StoreUserRequest;
use App\Http\Resources\Organisation\OrganisationUserResource;
use App\Models\OrganisationUser;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * An Organisation Representative managing their own organisation's team
 * members — every query and mutation is scoped to $request->user()->
 * organisation_id, never a client-supplied organisation ID, and the
 * Policy re-checks it again (defense in depth, see OrganisationPolicy).
 */
class UserController extends Controller
{
    use HasPaginatedResponse;

    public function index(Request $request): JsonResponse
    {
        /** @var OrganisationUser $actor */
        $actor = $request->user();
        $this->authorize('manageUsers', $actor->organisation);

        $users = OrganisationUser::where('organisation_id', $actor->organisation_id)
            ->latest()
            ->paginate(25);

        return $this->paginatedResponse($users, OrganisationUserResource::class);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        /** @var OrganisationUser $actor */
        $actor = $request->user();
        $this->authorize('manageUsers', $actor->organisation);

        $user = OrganisationUser::create([
            'organisation_id' => $actor->organisation_id,
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'role' => OrganisationRole::Representative,
        ]);

        $user->sendEmailVerificationNotification();

        AuditLogger::log('organisation.user_added', $user, [], $actor);

        return response()->json(['data' => new OrganisationUserResource($user)], 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        /** @var OrganisationUser $actor */
        $actor = $request->user();
        $this->authorize('manageUsers', $actor->organisation);

        $target = OrganisationUser::where('organisation_id', $actor->organisation_id)->findOrFail($id);

        if ($target->id === $actor->id) {
            return response()->json(['message' => 'You cannot remove your own account.'], 422);
        }

        $target->forceFill(['is_active' => false])->save();

        AuditLogger::log('organisation.user_deactivated', $target, [], $actor);

        return response()->json(['message' => 'Team member deactivated.']);
    }
}
