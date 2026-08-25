<?php

namespace App\Http\Controllers\Api\Organisation;

use App\Enums\PlacementStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Organisation\AssignmentFeedbackResource;
use App\Models\AssignmentFeedback;
use App\Models\OrganisationUser;
use App\Models\Placement;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * "Collect post-placement feedback" made available to the organisation
 * side too (approved Phase 4 symmetric-feedback decision). Only visible
 * once the placement is Confirmed — feedback about a placement that
 * never actually happened doesn't make sense.
 */
class AssignmentFeedbackController extends Controller
{
    public function index(Request $request, string $placementId): JsonResponse
    {
        $placement = Placement::findOrFail($placementId);
        $this->authorize('view', $placement);

        /** @var OrganisationUser $actor */
        $actor = $request->user();

        $feedback = $placement->feedback()->latest()->get()
            ->filter(fn (AssignmentFeedback $f) => Gate::forUser($actor)->allows('view', $f))
            ->values();

        return response()->json(['data' => AssignmentFeedbackResource::collection($feedback)]);
    }

    public function store(Request $request, string $placementId): JsonResponse
    {
        $request->validate([
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'comments' => ['nullable', 'string'],
        ]);

        $placement = Placement::findOrFail($placementId);
        $this->authorize('submitAsOrganisation', [AssignmentFeedback::class, $placement]);

        if ($placement->status !== PlacementStatus::Confirmed) {
            return response()->json(['message' => 'Feedback can only be submitted once the placement is confirmed.'], 422);
        }

        /** @var OrganisationUser $actor */
        $actor = $request->user();

        $feedback = AssignmentFeedback::updateOrCreate(
            ['placement_id' => $placement->id, 'submitter_type' => OrganisationUser::class, 'submitter_id' => $actor->id],
            ['rating' => $request->rating, 'comments' => $request->comments, 'submitted_at' => now()],
        );

        AuditLogger::log('assignment_feedback.submitted', $feedback, [], $actor);

        return response()->json(['data' => new AssignmentFeedbackResource($feedback)], 201);
    }
}
