<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AssignmentFeedbackResource;
use App\Models\AssignmentFeedback;
use App\Models\CandidatePipelineEntry;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/** RS-internal view — manager-tier sees both parties' feedback even before the mutual-visibility gate opens; a plain owning Recruiter waits for it like everyone else (see AssignmentFeedbackPolicy). */
class AssignmentFeedbackController extends Controller
{
    public function index(Request $request, string $assignmentId, string $entryId): JsonResponse
    {
        $entry = CandidatePipelineEntry::where('recruitment_assignment_id', $assignmentId)->findOrFail($entryId);
        $placement = $entry->placement()->firstOrFail();
        $this->authorize('view', $placement);

        /** @var User $actor */
        $actor = $request->user();

        $feedback = $placement->feedback()->with('submitter')->latest()->get()
            ->filter(fn (AssignmentFeedback $f) => Gate::forUser($actor)->allows('view', $f))
            ->values();

        AuditLogger::log('assignment_feedback.viewed', $placement, [], $actor);

        return response()->json(['data' => AssignmentFeedbackResource::collection($feedback)]);
    }
}
