<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HasPaginatedResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AdminOrganisationUserResource;
use App\Models\OrganisationUser;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** RS-side oversight of organisation accounts — read + suspend only, no creation (organisations self-register). */
class OrganisationUserController extends Controller
{
    use HasPaginatedResponse;

    public function index(Request $request): JsonResponse
    {
        $query = OrganisationUser::with('organisation');

        if ($organisationId = $request->query('organisation_id')) {
            $query->where('organisation_id', $organisationId);
        }

        $users = $query->latest()->paginate(25);

        return $this->paginatedResponse($users, AdminOrganisationUserResource::class);
    }

    public function toggleActive(Request $request, int $id): JsonResponse
    {
        $request->validate(['is_active' => ['required', 'boolean']]);

        $user = OrganisationUser::findOrFail($id);
        $user->forceFill(['is_active' => $request->boolean('is_active')])->save();

        AuditLogger::log(
            $user->is_active ? 'organisation_user.activated' : 'organisation_user.suspended',
            $user,
        );

        return response()->json([
            'message' => $user->is_active ? 'Account activated.' : 'Account suspended.',
            'is_active' => $user->is_active,
        ]);
    }
}
