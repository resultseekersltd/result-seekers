<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\CandidatePipelineStage;
use App\Enums\OpportunityInvitationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\CandidatePipelineEntryResource;
use App\Models\CandidatePipelineEntry;
use App\Models\OpportunityInvitation;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Section 15 "OPPORTUNITY INVITATION". Only reachable once a candidate has
 * been shortlisted — sending an invitation is what moves the entry to the
 * `invited` stage.
 */
class OpportunityInvitationController extends Controller
{
    public function store(Request $request, string $assignmentId, string $entryId): JsonResponse
    {
        $request->validate(['expires_in_days' => ['sometimes', 'integer', 'min:1', 'max:90']]);

        $entry = CandidatePipelineEntry::where('recruitment_assignment_id', $assignmentId)->findOrFail($entryId);
        $this->authorize('manage', $entry);

        if ($entry->stage !== CandidatePipelineStage::Shortlisted) {
            return response()->json(['message' => 'Only shortlisted candidates can be invited.'], 422);
        }

        /** @var User $actor */
        $actor = $request->user();

        // Expiry duration is not concretely specified by the source
        // documents — kept configurable per-invitation (default 14 days)
        // rather than a silently hardcoded business rule.
        $days = $request->integer('expires_in_days') ?: 14;

        $invitation = OpportunityInvitation::create([
            'candidate_pipeline_entry_id' => $entry->id,
            'status' => OpportunityInvitationStatus::Sent,
            'sent_at' => now(),
            'expires_at' => now()->addDays($days),
        ]);

        $entry->transitionTo(CandidatePipelineStage::Invited, $actor, 'Opportunity invitation sent.');

        AuditLogger::log('opportunity_invitation.sent', $invitation, [], $actor);

        return response()->json([
            'data' => [
                'invitation_id' => $invitation->id,
                'status' => $invitation->status->value,
                'entry' => new CandidatePipelineEntryResource($entry->fresh(['profile', 'invitation', 'consents'])),
            ],
        ], 201);
    }
}
