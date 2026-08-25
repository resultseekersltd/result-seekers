<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\OrganisationStatus;
use App\Http\Controllers\Concerns\HasPaginatedResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AdminOrganisationResource;
use App\Models\Organisation;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganisationController extends Controller
{
    use HasPaginatedResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Organisation::withCount('users');

        if ($search = $request->query('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $organisations = $query->latest()->paginate(25);

        return $this->paginatedResponse($organisations, AdminOrganisationResource::class);
    }

    /**
     * expert-network.txt, "MULTI-TENANT ISOLATION": "Super Admin access to
     * client data must be audited" — every RS-staff view of an
     * organisation's private detail (contact info, registration number,
     * etc.) is logged, not only mutations, so this is the one read-only
     * action in the codebase with its own audit call site.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $organisation = Organisation::withCount('users')->findOrFail($id);
        $this->authorize('view', $organisation);

        AuditLogger::log('organisation.viewed', $organisation);

        return response()->json(['data' => new AdminOrganisationResource($organisation)]);
    }

    /**
     * Verification status transitions — "Manual Result Seekers approval"
     * per talent-expert.txt. Gated by OrganisationPolicy::verify(), which
     * only OrganisationVerify permission holders pass (Super Admin,
     * Recruitment Manager — see RolePermissions' documented inference).
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'string', 'in:pending_verification,clarification_requested,verified,rejected,suspended,restricted,archived'],
        ]);

        $organisation = Organisation::findOrFail($id);
        $this->authorize('verify', $organisation);

        $data = ['status' => $request->status];

        if ($request->status === OrganisationStatus::Verified->value) {
            $data['verified_at'] = now();
            $data['verified_by'] = $request->user()->id;
        }

        $organisation->update($data);

        // expert-network.txt: Super Admin / RS staff access to organisation
        // data must be auditable — this transition is the clearest case.
        AuditLogger::log('organisation.status_changed', $organisation, ['status' => $request->status]);

        return response()->json(['data' => new AdminOrganisationResource($organisation->fresh())]);
    }
}
