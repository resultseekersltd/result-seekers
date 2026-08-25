<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HasPaginatedResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\VerificationCaseResource;
use App\Models\CandidatePipelineEntry;
use App\Models\ExpertPoolProfile;
use App\Models\User;
use App\Models\VerificationCase;
use App\Models\VerificationCheck;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Foundation only — talent-expert.txt's Verifier role ("review identity/
 * education/certifications/employment/references... approve or reject
 * individual verification checks") without the full workflow automation
 * (assignment, escalation, fraud-flag routing) that's deferred alongside
 * the rest of Verifier dashboard work.
 */
class VerificationCaseController extends Controller
{
    use HasPaginatedResponse;

    public function index(Request $request): JsonResponse
    {
        $query = VerificationCase::with(['profile.expertUser', 'checks']);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $cases = $query->latest()->paginate(25);

        return $this->paginatedResponse($cases, VerificationCaseResource::class);
    }

    /**
     * Phase 3: opening a case did not have an API entry point before —
     * cases could only be reviewed, never created. Optionally tied to a
     * recruitment assignment's pipeline entry when opened mid-pipeline.
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', VerificationCase::class);

        $request->validate([
            'expert_pool_profile_id' => ['required', 'integer', 'exists:expert_pool_profiles,id'],
            'candidate_pipeline_entry_id' => ['nullable', 'string', 'exists:candidate_pipeline_entries,id'],
            'target_level' => ['nullable', 'string'],
        ]);

        ExpertPoolProfile::findOrFail($request->integer('expert_pool_profile_id'));
        if ($entryId = $request->string('candidate_pipeline_entry_id')->toString()) {
            CandidatePipelineEntry::findOrFail($entryId);
        }

        /** @var User $actor */
        $actor = $request->user();

        $case = VerificationCase::create([
            'expert_pool_profile_id' => $request->integer('expert_pool_profile_id'),
            'candidate_pipeline_entry_id' => $entryId ?: null,
            'target_level' => $request->target_level,
            'status' => 'not_started',
            'opened_by' => $actor->id,
            'opened_at' => now(),
        ]);

        AuditLogger::log('verification_case.opened', $case, [], $actor);

        return response()->json(['data' => new VerificationCaseResource($case->load(['profile.expertUser', 'checks']))], 201);
    }

    /** Adds a granular check to an already-opened case — "Identity verified / Degree verified / ..." (talent-expert.txt). */
    public function storeCheck(Request $request, string $caseId): JsonResponse
    {
        $case = VerificationCase::findOrFail($caseId);
        $this->authorize('create', VerificationCase::class);

        $request->validate([
            'check_type' => ['required', 'string', 'max:100'],
            'subject' => ['nullable', 'string', 'max:255'],
        ]);

        $check = VerificationCheck::create([
            'verification_case_id' => $case->id,
            'check_type' => $request->check_type,
            'subject' => $request->subject,
            'status' => 'not_started',
        ]);

        /** @var User $actor */
        $actor = $request->user();
        AuditLogger::log('verification_check.added', $check, ['check_type' => $check->check_type], $actor);

        return response()->json(['data' => new VerificationCaseResource($case->fresh(['profile.expertUser', 'checks']))], 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $case = VerificationCase::with(['profile.expertUser', 'checks.verifier'])->findOrFail($id);
        $this->authorize('view', $case);

        return response()->json(['data' => new VerificationCaseResource($case)]);
    }

    public function updateCheck(Request $request, string $caseId, string $checkId): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'string', 'in:pending,under_review,clarification_requested,verified,partially_verified,unable_to_verify,rejected'],
            'internal_notes' => ['nullable', 'string'],
            'rejection_reason' => ['nullable', 'string'],
        ]);

        $case = VerificationCase::findOrFail($caseId);
        $check = VerificationCheck::where('verification_case_id', $case->id)->findOrFail($checkId);

        $action = $request->status === 'verified' ? 'approve' : 'review';
        $this->authorize($action, $case);

        $data = [
            'status' => $request->status,
            'verifier_id' => $request->user()->id,
            'internal_notes' => $request->internal_notes,
            'rejection_reason' => $request->rejection_reason,
        ];

        if (in_array($request->status, ['verified', 'partially_verified', 'unable_to_verify', 'rejected'], true)) {
            $data['completed_at'] = now();
        } elseif (! $check->started_at) {
            $data['started_at'] = now();
        }

        $check->update($data);

        AuditLogger::log('verification_check.status_changed', $check, ['status' => $request->status]);

        return response()->json(['data' => new VerificationCaseResource($case->fresh(['profile.expertUser', 'checks.verifier']))]);
    }
}
