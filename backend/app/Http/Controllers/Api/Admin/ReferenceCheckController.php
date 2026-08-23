<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\Permission;
use App\Enums\ReferenceCheckStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\ReferenceCheckResource;
use App\Models\CandidatePipelineEntry;
use App\Models\ReferenceCheck;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Phase 3 "REFERENCE CHECKING", nested under the owning pipeline entry.
 * Referee contact info and verification_notes never leave this
 * controller's Admin resource — no Organisation- or ExpertPool-facing
 * endpoint returns a ReferenceCheck at all.
 */
class ReferenceCheckController extends Controller
{
    public function index(Request $request, string $assignmentId, string $entryId): JsonResponse
    {
        $entry = CandidatePipelineEntry::where('recruitment_assignment_id', $assignmentId)->findOrFail($entryId);
        $this->authorize('view', $entry);

        $checks = ReferenceCheck::with('requestedBy')
            ->where('candidate_pipeline_entry_id', $entry->id)
            ->latest()
            ->get();

        return response()->json(['data' => ReferenceCheckResource::collection($checks)]);
    }

    /** talent-expert.txt: "Reference checks require candidate consent" — consent must already be recorded to create the row. */
    public function store(Request $request, string $assignmentId, string $entryId): JsonResponse
    {
        $request->validate([
            'referee_name' => ['required', 'string', 'max:255'],
            'referee_relationship' => ['nullable', 'string', 'max:255'],
            'referee_organisation' => ['nullable', 'string', 'max:255'],
            'contact_method' => ['nullable', 'string', 'max:100'],
            'referee_contact' => ['nullable', 'string', 'max:255'],
            'candidate_consented' => ['required', 'accepted'],
            'consent_text_version' => ['required', 'string', 'max:50'],
        ]);

        $entry = CandidatePipelineEntry::where('recruitment_assignment_id', $assignmentId)->findOrFail($entryId);

        /** @var User $actor */
        $actor = $request->user();
        if (! $actor->hasPermission(Permission::ReferenceCheckManage)) {
            throw new AccessDeniedHttpException('You do not have permission to manage reference checks.');
        }

        $referenceCheck = ReferenceCheck::create([
            'candidate_pipeline_entry_id' => $entry->id,
            'referee_name' => $request->referee_name,
            'referee_relationship' => $request->referee_relationship,
            'referee_organisation' => $request->referee_organisation,
            'contact_method' => $request->contact_method,
            'referee_contact' => $request->referee_contact,
            'candidate_consented_at' => now(),
            'consent_text_version' => $request->consent_text_version,
            'status' => ReferenceCheckStatus::Requested,
            'requested_by' => $actor->id,
        ]);

        AuditLogger::log('reference_check.created', $referenceCheck, [], $actor);

        return response()->json(['data' => new ReferenceCheckResource($referenceCheck)], 201);
    }

    public function update(Request $request, string $assignmentId, string $entryId, string $referenceCheckId): JsonResponse
    {
        $request->validate([
            'status' => ['sometimes', 'string', 'in:contacted,completed,unable_to_reach,declined'],
            'date_contacted' => ['nullable', 'date'],
            'response_status' => ['nullable', 'string', 'max:255'],
            'verification_notes' => ['nullable', 'string'],
            'risk_flags' => ['nullable', 'string'],
            'final_outcome' => ['nullable', 'string', 'in:positive,negative,mixed,inconclusive'],
        ]);

        $entry = CandidatePipelineEntry::where('recruitment_assignment_id', $assignmentId)->findOrFail($entryId);
        $referenceCheck = ReferenceCheck::where('candidate_pipeline_entry_id', $entry->id)->findOrFail($referenceCheckId);

        /** @var User $actor */
        $actor = $request->user();
        if (! $actor->hasPermission(Permission::ReferenceCheckManage)) {
            throw new AccessDeniedHttpException('You do not have permission to manage reference checks.');
        }

        $referenceCheck->update($request->only([
            'status', 'date_contacted', 'response_status', 'verification_notes', 'risk_flags', 'final_outcome',
        ]));

        AuditLogger::log('reference_check.outcome_recorded', $referenceCheck, ['status' => $referenceCheck->status?->value], $actor);

        return response()->json(['data' => new ReferenceCheckResource($referenceCheck->fresh('requestedBy'))]);
    }
}
