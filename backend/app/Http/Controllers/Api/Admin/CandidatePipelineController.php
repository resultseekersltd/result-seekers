<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\CandidateConsentStatus;
use App\Enums\CandidatePipelineOutcome;
use App\Enums\CandidatePipelineStage;
use App\Http\Controllers\Concerns\HasPaginatedResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\CandidatePipelineEntryResource;
use App\Models\CandidateConsent;
use App\Models\CandidatePipelineEntry;
use App\Models\RecruitmentAssignment;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Section 10-13 "CANDIDATE PIPELINE" / "SCREENING" / "INTERNAL LONGLIST" /
 * "RESULT SEEKERS QUALITY REVIEW". Longlist and shortlist are not separate
 * tables — they are `stage` values on CandidatePipelineEntry (see the
 * migration's docblock) — so "the internal longlist for an assignment" is
 * simply this index filtered to stage >= longlisted.
 */
class CandidatePipelineController extends Controller
{
    use HasPaginatedResponse;

    public function index(Request $request, string $assignmentId): JsonResponse
    {
        $assignment = RecruitmentAssignment::findOrFail($assignmentId);
        $this->authorize('view', $assignment);

        $query = CandidatePipelineEntry::with(['profile', 'invitation', 'consents'])
            ->where('recruitment_assignment_id', $assignment->id);

        if ($stage = $request->query('stage')) {
            $query->where('stage', $stage);
        }

        $entries = $query->latest()->paginate(25);

        return $this->paginatedResponse($entries, CandidatePipelineEntryResource::class);
    }

    /** Add a candidate (from recruiter search) to this assignment's pipeline. */
    public function store(Request $request, string $assignmentId): JsonResponse
    {
        $request->validate(['expert_pool_profile_id' => ['required', 'integer', 'exists:expert_pool_profiles,id']]);

        $assignment = RecruitmentAssignment::findOrFail($assignmentId);
        $this->authorize('manage', $assignment);

        /** @var User $actor */
        $actor = $request->user();

        $entry = CandidatePipelineEntry::create([
            'recruitment_assignment_id' => $assignment->id,
            'expert_pool_profile_id' => $request->integer('expert_pool_profile_id'),
            'stage' => CandidatePipelineStage::Identified,
            'added_by' => $actor->id,
        ]);

        AuditLogger::log('candidate_pipeline.candidate_added', $entry, [], $actor);

        return response()->json(['data' => new CandidatePipelineEntryResource($entry->load(['profile', 'invitation', 'consents']))], 201);
    }

    /** Section 11 SCREENING — an "eligible" decision advances the candidate onto the internal longlist. */
    public function screen(Request $request, string $assignmentId, string $entryId): JsonResponse
    {
        $request->validate([
            'decision' => ['required', 'string', 'in:eligible,not_eligible,needs_clarification'],
            'notes' => ['nullable', 'string'],
        ]);

        $entry = CandidatePipelineEntry::where('recruitment_assignment_id', $assignmentId)->findOrFail($entryId);
        $this->authorize('manage', $entry);

        /** @var User $actor */
        $actor = $request->user();

        $entry->update([
            'screening_decision' => $request->decision,
            'screening_notes' => $request->notes,
            'screened_by' => $actor->id,
            'screened_at' => now(),
        ]);

        if ($request->decision === 'eligible') {
            $entry->transitionTo(CandidatePipelineStage::Longlisted, $actor, 'Screening passed.');
        } elseif ($request->decision === 'not_eligible') {
            $entry->update(['outcome' => CandidatePipelineOutcome::NotSelected, 'outcome_reason' => $request->notes]);
        }

        AuditLogger::log('candidate_pipeline.screened', $entry, ['decision' => $request->decision], $actor);

        return response()->json(['data' => new CandidatePipelineEntryResource($entry->fresh(['profile', 'invitation', 'consents']))]);
    }

    /**
     * Section 13 RESULT SEEKERS QUALITY REVIEW — gated to Recruitment
     * Manager/Super Admin via the policy. An "approved" decision is what
     * produces the proposed shortlist.
     */
    public function qualityReview(Request $request, string $assignmentId, string $entryId): JsonResponse
    {
        $request->validate([
            'decision' => ['required', 'string', 'in:approved,rejected,changes_requested'],
            'notes' => ['nullable', 'string'],
        ]);

        $entry = CandidatePipelineEntry::where('recruitment_assignment_id', $assignmentId)->findOrFail($entryId);
        $this->authorize('performQualityReview', $entry);

        /** @var User $actor */
        $actor = $request->user();

        $entry->update([
            'quality_review_decision' => $request->decision,
            'quality_review_notes' => $request->notes,
            'quality_reviewed_by' => $actor->id,
            'quality_reviewed_at' => now(),
        ]);

        if ($request->decision === 'approved') {
            $entry->transitionTo(CandidatePipelineStage::Shortlisted, $actor, 'Quality review approved.');
        }

        AuditLogger::log('candidate_pipeline.quality_reviewed', $entry, ['decision' => $request->decision], $actor);

        return response()->json(['data' => new CandidatePipelineEntryResource($entry->fresh(['profile', 'invitation', 'consents']))]);
    }

    /**
     * "Request candidate consent" (explicit Recruiter capability) — only
     * meaningful once the professional has already expressed interest
     * (stage = interested). Creates the CandidateConsent record and moves
     * the entry to consent_pending.
     */
    public function requestConsent(Request $request, string $assignmentId, string $entryId): JsonResponse
    {
        $entry = CandidatePipelineEntry::with('assignment')->where('recruitment_assignment_id', $assignmentId)->findOrFail($entryId);
        $this->authorize('manage', $entry);

        if ($entry->stage !== CandidatePipelineStage::Interested) {
            return response()->json(['message' => 'Consent can only be requested after the professional has expressed interest.'], 422);
        }

        /** @var User $actor */
        $actor = $request->user();

        $consent = CandidateConsent::create([
            'expert_pool_profile_id' => $entry->expert_pool_profile_id,
            'organisation_id' => $entry->assignment->organisation_id,
            'talent_request_id' => $entry->assignment->talent_request_id,
            'candidate_pipeline_entry_id' => $entry->id,
            'purpose' => 'Candidate disclosure for recruitment assignment '.$entry->assignment->reference,
            'consent_text_version' => 'v1',
            'status' => CandidateConsentStatus::Requested,
            'requested_at' => now(),
        ]);

        $entry->transitionTo(CandidatePipelineStage::ConsentPending, $actor, 'Consent requested.');

        AuditLogger::log('candidate_consent.requested', $consent, [], $actor);

        return response()->json([
            'data' => [
                'consent_id' => $consent->id,
                'entry' => new CandidatePipelineEntryResource($entry->fresh(['profile', 'invitation', 'consents'])),
            ],
        ], 201);
    }
}
