<?php

namespace App\Http\Controllers\Api\Organisation;

use App\Enums\PlacementStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Organisation\PlacementResource;
use App\Models\OrganisationUser;
use App\Models\Placement;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * The organisation's own view of placements — scoped strictly to
 * candidates already released to their tenant, same boundary
 * InterviewController/ReleasedCandidateController already enforce.
 */
class PlacementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var OrganisationUser $actor */
        $actor = $request->user();

        $placements = Placement::whereHas(
            'pipelineEntry.consents.releases',
            fn ($q) => $q->where('released_to_organisation_id', $actor->organisation_id),
        )->latest()->get();

        return response()->json(['data' => PlacementResource::collection($placements)]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $placement = Placement::findOrFail($id);
        $this->authorize('view', $placement);

        return response()->json(['data' => new PlacementResource($placement)]);
    }

    public function confirm(Request $request, string $id): JsonResponse
    {
        $placement = Placement::findOrFail($id);
        $this->authorize('confirmAsOrganisation', $placement);

        if ($placement->status === PlacementStatus::Cancelled) {
            return response()->json(['message' => 'This placement has been cancelled and cannot be confirmed.'], 422);
        }

        /** @var OrganisationUser $actor */
        $actor = $request->user();

        if ($placement->organisation_confirmed_at === null) {
            $placement->update(['organisation_confirmed_at' => now(), 'organisation_confirmed_by' => $actor->id]);
            $placement->checkAndMarkConfirmed();

            AuditLogger::log('placement.organisation_confirmed', $placement, [], $actor);
            if ($placement->fresh()->status->value === 'confirmed') {
                AuditLogger::log('placement.placed', $placement, [], $actor);
            }
        }

        return response()->json(['data' => new PlacementResource($placement->fresh())]);
    }
}
