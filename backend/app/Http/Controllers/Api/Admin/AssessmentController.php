<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\AssessmentStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AssessmentResource;
use App\Models\Assessment;
use App\Models\AssessmentScore;
use App\Models\CandidatePipelineEntry;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Phase 3 "ASSESSMENTS", nested under the owning pipeline entry — same
 * assignment-ownership authorization shape as Phase 2's
 * CandidatePipelineController.
 */
class AssessmentController extends Controller
{
    public function index(Request $request, string $assignmentId, string $entryId): JsonResponse
    {
        $entry = CandidatePipelineEntry::where('recruitment_assignment_id', $assignmentId)->findOrFail($entryId);
        $this->authorize('viewAny', [Assessment::class, $entry]);

        $assessments = Assessment::with(['assignedBy', 'reviewer', 'submissions.score.reviewer'])
            ->where('candidate_pipeline_entry_id', $entry->id)
            ->latest()
            ->get();

        return response()->json(['data' => AssessmentResource::collection($assessments)]);
    }

    public function store(Request $request, string $assignmentId, string $entryId): JsonResponse
    {
        $request->validate([
            'type' => ['required', 'string', 'in:multiple_choice,written_response,file_submission,technical_assignment,practical,language,custom'],
            'title' => ['required', 'string', 'max:255'],
            'instructions' => ['nullable', 'string'],
            'time_limit_minutes' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'closes_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'attempt_limit' => ['nullable', 'integer', 'min:1'],
            'scoring_rules' => ['nullable', 'array'],
            'result_visible_to_candidate' => ['sometimes', 'boolean'],
            'reviewer_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $entry = CandidatePipelineEntry::where('recruitment_assignment_id', $assignmentId)->findOrFail($entryId);
        $this->authorize('create', [Assessment::class, $entry]);

        /** @var User $actor */
        $actor = $request->user();

        $assessment = Assessment::create([
            'candidate_pipeline_entry_id' => $entry->id,
            'type' => $request->type,
            'title' => $request->title,
            'instructions' => $request->instructions,
            'time_limit_minutes' => $request->time_limit_minutes,
            'starts_at' => $request->starts_at,
            'closes_at' => $request->closes_at,
            'attempt_limit' => $request->attempt_limit,
            'scoring_rules' => $request->scoring_rules,
            'status' => AssessmentStatus::Assigned,
            'result_visible_to_candidate' => $request->boolean('result_visible_to_candidate'),
            'assigned_by' => $actor->id,
            'reviewer_id' => $request->integer('reviewer_id') ?: null,
        ]);

        AuditLogger::log('assessment.created', $assessment, ['type' => $assessment->type], $actor);

        return response()->json(['data' => new AssessmentResource($assessment)], 201);
    }

    public function show(Request $request, string $assignmentId, string $entryId, string $assessmentId): JsonResponse
    {
        $entry = CandidatePipelineEntry::where('recruitment_assignment_id', $assignmentId)->findOrFail($entryId);

        $assessment = Assessment::with(['assignedBy', 'reviewer', 'submissions.score.reviewer'])
            ->where('candidate_pipeline_entry_id', $entry->id)
            ->findOrFail($assessmentId);

        $this->authorize('view', $assessment);

        return response()->json(['data' => new AssessmentResource($assessment)]);
    }

    /** Owning recruiter/manager downloads a candidate's submitted file — never a public URL, mirrors CvController::download(). */
    public function downloadFile(Request $request, string $assignmentId, string $entryId, string $assessmentId, string $submissionId): mixed
    {
        $entry = CandidatePipelineEntry::where('recruitment_assignment_id', $assignmentId)->findOrFail($entryId);
        $assessment = Assessment::where('candidate_pipeline_entry_id', $entry->id)->findOrFail($assessmentId);
        $this->authorize('view', $assessment);

        $submission = $assessment->submissions()->findOrFail($submissionId);

        if (! $submission->file_path || ! Storage::disk('local')->exists($submission->file_path)) {
            return response()->json(['message' => 'No file found for this submission.'], 404);
        }

        return Storage::disk('local')->download(
            $submission->file_path,
            $submission->file_original_name ?? 'submission.'.pathinfo($submission->file_path, PATHINFO_EXTENSION),
        );
    }

    /** Reviewer scores the candidate's latest submission — structured, explainable, never automated. */
    public function score(Request $request, string $assignmentId, string $entryId, string $assessmentId, string $submissionId): JsonResponse
    {
        $request->validate([
            'score' => ['required', 'numeric', 'min:0'],
            'max_score' => ['required', 'numeric', 'gt:0'],
            'criteria_breakdown' => ['nullable', 'array'],
            'review_notes' => ['nullable', 'string'],
        ]);

        $entry = CandidatePipelineEntry::where('recruitment_assignment_id', $assignmentId)->findOrFail($entryId);
        $assessment = Assessment::where('candidate_pipeline_entry_id', $entry->id)->findOrFail($assessmentId);
        $this->authorize('manage', $assessment);

        $submission = $assessment->submissions()->findOrFail($submissionId);

        /** @var User $actor */
        $actor = $request->user();

        $score = AssessmentScore::updateOrCreate(
            ['assessment_submission_id' => $submission->id],
            [
                'reviewer_id' => $actor->id,
                'score' => $request->float('score'),
                'max_score' => $request->float('max_score'),
                'criteria_breakdown' => $request->criteria_breakdown,
                'review_notes' => $request->review_notes,
                'reviewed_at' => now(),
            ],
        );

        $assessment->update(['status' => AssessmentStatus::Reviewed]);

        AuditLogger::log('assessment.reviewed', $assessment, ['score' => $score->score, 'max_score' => $score->max_score], $actor);

        return response()->json(['data' => new AssessmentResource($assessment->fresh(['assignedBy', 'reviewer', 'submissions.score.reviewer']))]);
    }
}
