<?php

namespace App\Http\Controllers\Api\ExpertPool;

use App\Enums\AssessmentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\ExpertPool\UploadAssessmentFileRequest;
use App\Http\Resources\ExpertPool\AssessmentResource;
use App\Models\Assessment;
use App\Models\AssessmentSubmission;
use App\Models\ExpertUser;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * The professional's own assessment queue — every query scoped through
 * the caller's own ExpertPoolProfile, same 404-on-mismatch pattern as
 * OpportunityController/ConsentController.
 */
class AssessmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var ExpertUser $user */
        $user = $request->user();
        $profile = $user->profile()->firstOrFail();

        $assessments = Assessment::with('submissions.score')
            ->whereHas('pipelineEntry', fn ($q) => $q->where('expert_pool_profile_id', $profile->id))
            ->latest()
            ->get();

        return response()->json(['data' => AssessmentResource::collection($assessments)]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $assessment = $this->findOwnedAssessment($request, $id);

        return response()->json(['data' => new AssessmentResource($assessment)]);
    }

    public function submit(UploadAssessmentFileRequest $request, string $id): JsonResponse
    {
        $assessment = $this->findOwnedAssessment($request, $id);

        if (in_array($assessment->status, [AssessmentStatus::Reviewed, AssessmentStatus::Expired, AssessmentStatus::Cancelled], true)) {
            return response()->json(['message' => 'This assessment is no longer accepting responses.'], 422);
        }

        $attemptCount = $assessment->submissions()->count();
        if ($assessment->attempt_limit && $attemptCount >= $assessment->attempt_limit) {
            return response()->json(['message' => 'You have reached the maximum number of attempts for this assessment.'], 422);
        }

        /** @var ExpertUser $user */
        $user = $request->user();

        $filePath = null;
        $fileOriginalName = null;
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $extension = $file->getClientOriginalExtension();
            $filePath = 'assessment-submissions/'.$user->id.'/'.$assessment->id.'/'.Str::uuid().'.'.$extension;
            $fileOriginalName = $file->getClientOriginalName();
            Storage::disk('local')->putFileAs(dirname($filePath), $file, basename($filePath));
        }

        $submission = AssessmentSubmission::create([
            'assessment_id' => $assessment->id,
            'attempt_number' => $attemptCount + 1,
            'response_text' => $request->response_text,
            'file_path' => $filePath,
            'file_original_name' => $fileOriginalName,
            'answers' => $request->answers,
            'submitted_at' => now(),
        ]);

        $assessment->update(['status' => AssessmentStatus::Submitted]);

        AuditLogger::log('assessment.submitted', $assessment, ['attempt_number' => $submission->attempt_number, 'has_file' => $filePath !== null], $user);

        return response()->json(['data' => new AssessmentResource($assessment->fresh('submissions.score'))]);
    }

    /** Streams the candidate's own submitted file — never a public URL, mirrors CvController::download(). */
    public function downloadFile(Request $request, string $id, string $submissionId): mixed
    {
        $assessment = $this->findOwnedAssessment($request, $id);
        $submission = $assessment->submissions()->findOrFail($submissionId);

        if (! $submission->file_path || ! Storage::disk('local')->exists($submission->file_path)) {
            return response()->json(['message' => 'No file found for this submission.'], 404);
        }

        return Storage::disk('local')->download(
            $submission->file_path,
            $submission->file_original_name ?? 'submission.'.pathinfo($submission->file_path, PATHINFO_EXTENSION),
        );
    }

    private function findOwnedAssessment(Request $request, string $id): Assessment
    {
        /** @var ExpertUser $user */
        $user = $request->user();
        $profile = $user->profile()->firstOrFail();

        return Assessment::with('submissions.score')
            ->whereHas('pipelineEntry', fn ($q) => $q->where('expert_pool_profile_id', $profile->id))
            ->findOrFail($id);
    }
}
