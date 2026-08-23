<?php

namespace App\Http\Controllers\Api\ExpertPool;

use App\Enums\PlacementStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ExpertPool\AssignmentFeedbackResource;
use App\Models\AssignmentFeedback;
use App\Models\ExpertUser;
use App\Models\Placement;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AssignmentFeedbackController extends Controller
{
    public function index(Request $request, string $placementId): JsonResponse
    {
        $placement = Placement::findOrFail($placementId);
        $this->authorize('view', $placement);

        /** @var ExpertUser $actor */
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
        $this->authorize('submitAsProfessional', [AssignmentFeedback::class, $placement]);

        if ($placement->status !== PlacementStatus::Confirmed) {
            return response()->json(['message' => 'Feedback can only be submitted once the placement is confirmed.'], 422);
        }

        /** @var ExpertUser $actor */
        $actor = $request->user();

        $feedback = AssignmentFeedback::updateOrCreate(
            ['placement_id' => $placement->id, 'submitter_type' => ExpertUser::class, 'submitter_id' => $actor->id],
            ['rating' => $request->rating, 'comments' => $request->comments, 'submitted_at' => now()],
        );

        AuditLogger::log('assignment_feedback.submitted', $feedback, [], $actor);

        return response()->json(['data' => new AssignmentFeedbackResource($feedback)], 201);
    }
}
