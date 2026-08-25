<?php

namespace App\Http\Controllers\Api\ExpertPool;

use App\Enums\PlacementStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ExpertPool\PlacementResource;
use App\Models\ExpertUser;
use App\Models\Placement;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** The professional's own view of placements — scoped through their own ExpertPoolProfile, same 404-on-mismatch pattern as the rest of Phase 2/3. */
class PlacementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var ExpertUser $user */
        $user = $request->user();
        $profile = $user->profile()->firstOrFail();

        $placements = Placement::whereHas('pipelineEntry', fn ($q) => $q->where('expert_pool_profile_id', $profile->id))
            ->latest()
            ->get();

        return response()->json(['data' => PlacementResource::collection($placements)]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        return response()->json(['data' => new PlacementResource($this->findOwnedPlacement($request, $id))]);
    }

    public function confirm(Request $request, string $id): JsonResponse
    {
        $placement = $this->findOwnedPlacement($request, $id);

        if ($placement->status === PlacementStatus::Cancelled) {
            return response()->json(['message' => 'This placement has been cancelled and cannot be confirmed.'], 422);
        }

        /** @var ExpertUser $user */
        $user = $request->user();

        if ($placement->professional_confirmed_at === null) {
            $placement->update(['professional_confirmed_at' => now(), 'professional_confirmed_by' => $user->id]);
            $placement->checkAndMarkConfirmed();

            AuditLogger::log('placement.professional_confirmed', $placement, [], $user);
            if ($placement->fresh()->status->value === 'confirmed') {
                AuditLogger::log('placement.placed', $placement, [], $user);
            }
        }

        return response()->json(['data' => new PlacementResource($placement->fresh())]);
    }

    private function findOwnedPlacement(Request $request, string $id): Placement
    {
        /** @var ExpertUser $user */
        $user = $request->user();
        $profile = $user->profile()->firstOrFail();

        return Placement::whereHas('pipelineEntry', fn ($q) => $q->where('expert_pool_profile_id', $profile->id))
            ->findOrFail($id);
    }
}
