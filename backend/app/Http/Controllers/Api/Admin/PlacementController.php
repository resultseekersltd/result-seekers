<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\PlacementStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\PlacementResource;
use App\Models\CandidatePipelineEntry;
use App\Models\Placement;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Phase 4 "Placement", nested under the owning pipeline entry — same
 * assignment-ownership shape as every other Phase 2/3 entry-scoped
 * controller. One placement per entry (unique constraint); creation
 * restricted to the owning Recruiter or manager-tier, reusing the
 * existing CandidatePipelineManage/QualityReviewPerform permissions —
 * no new permission was introduced for this.
 */
class PlacementController extends Controller
{
    public function show(Request $request, string $assignmentId, string $entryId): JsonResponse
    {
        $entry = CandidatePipelineEntry::where('recruitment_assignment_id', $assignmentId)->findOrFail($entryId);
        $placement = Placement::with(['organisationConfirmedBy', 'professionalConfirmedBy', 'creator'])
            ->where('candidate_pipeline_entry_id', $entry->id)
            ->firstOrFail();

        $this->authorize('view', $placement);

        return response()->json(['data' => new PlacementResource($placement)]);
    }

    public function store(Request $request, string $assignmentId, string $entryId): JsonResponse
    {
        $request->validate([
            'engagement_type' => ['nullable', 'string', 'max:100'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'deployment_location' => ['nullable', 'string', 'max:255'],
            'deployment_notes' => ['nullable', 'string'],
            'onboarding_notes' => ['nullable', 'string'],
        ]);

        $entry = CandidatePipelineEntry::where('recruitment_assignment_id', $assignmentId)->findOrFail($entryId);
        $this->authorize('create', [Placement::class, $entry]);

        if ($entry->placement()->exists()) {
            return response()->json(['message' => 'A placement already exists for this candidate.'], 422);
        }

        /** @var User $actor */
        $actor = $request->user();

        $placement = Placement::create([
            'candidate_pipeline_entry_id' => $entry->id,
            'engagement_type' => $request->engagement_type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'deployment_location' => $request->deployment_location,
            'deployment_notes' => $request->deployment_notes,
            'onboarding_notes' => $request->onboarding_notes,
            'status' => PlacementStatus::PendingConfirmation,
            'created_by' => $actor->id,
        ]);

        AuditLogger::log('placement.created', $placement, ['candidate_pipeline_entry_id' => $entry->id], $actor);

        return response()->json(['data' => new PlacementResource($placement->load(['organisationConfirmedBy', 'professionalConfirmedBy', 'creator']))], 201);
    }

    public function cancel(Request $request, string $assignmentId, string $entryId): JsonResponse
    {
        $entry = CandidatePipelineEntry::where('recruitment_assignment_id', $assignmentId)->findOrFail($entryId);
        $placement = Placement::where('candidate_pipeline_entry_id', $entry->id)->firstOrFail();
        $this->authorize('manage', $placement);

        if ($placement->status === PlacementStatus::Confirmed) {
            return response()->json(['message' => 'A confirmed placement cannot be cancelled here.'], 422);
        }

        $placement->update(['status' => PlacementStatus::Cancelled]);

        /** @var User $actor */
        $actor = $request->user();
        AuditLogger::log('placement.cancelled', $placement, [], $actor);

        return response()->json(['data' => new PlacementResource($placement->fresh(['organisationConfirmedBy', 'professionalConfirmedBy', 'creator']))]);
    }
}
