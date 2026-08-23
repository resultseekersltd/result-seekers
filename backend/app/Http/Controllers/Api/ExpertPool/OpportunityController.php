<?php

namespace App\Http\Controllers\Api\ExpertPool;

use App\Enums\CandidatePipelineOutcome;
use App\Enums\CandidatePipelineStage;
use App\Enums\OpportunityInvitationStatus;
use App\Http\Controllers\Concerns\HasPaginatedResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\ExpertPool\OpportunityResource;
use App\Models\ExpertUser;
use App\Models\OpportunityInvitation;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Section 23 "PROFESSIONAL/EXPERT" workspace — Opportunities, accept/
 * decline. Every query is scoped through the caller's own
 * ExpertPoolProfile; there is no ID a professional could supply to reach
 * another professional's invitation (see the 404-on-mismatch pattern
 * already used by ExperienceController/EducationController in Phase 0).
 */
class OpportunityController extends Controller
{
    use HasPaginatedResponse;

    public function index(Request $request): JsonResponse
    {
        /** @var ExpertUser $user */
        $user = $request->user();
        $profile = $user->profile()->firstOrFail();

        $invitations = OpportunityInvitation::whereHas(
            'entry',
            fn ($q) => $q->where('expert_pool_profile_id', $profile->id)
        )->with('entry.assignment')->latest()->paginate(25);

        return $this->paginatedResponse($invitations, OpportunityResource::class);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $invitation = $this->findOwnedInvitation($request, $id);

        return response()->json(['data' => new OpportunityResource($invitation->load('entry.assignment'))]);
    }

    public function respond(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'response' => ['required', 'string', 'in:accept,decline'],
            'decline_reason' => ['nullable', 'string'],
        ]);

        $invitation = $this->findOwnedInvitation($request, $id);

        if ($invitation->status !== OpportunityInvitationStatus::Sent) {
            return response()->json(['message' => 'This invitation has already been responded to or is no longer active.'], 422);
        }

        /** @var ExpertUser $user */
        $user = $request->user();
        $entry = $invitation->entry;

        if ($request->response === 'accept') {
            $invitation->update(['status' => OpportunityInvitationStatus::Accepted, 'responded_at' => now()]);
            $entry->transitionTo(CandidatePipelineStage::Interested, null, 'Professional expressed interest.');
            AuditLogger::log('opportunity_invitation.accepted', $invitation, [], $user);
        } else {
            $invitation->update([
                'status' => OpportunityInvitationStatus::Declined,
                'responded_at' => now(),
                'decline_reason' => $request->decline_reason,
            ]);
            $entry->update(['outcome' => CandidatePipelineOutcome::DeclinedByCandidate, 'outcome_reason' => $request->decline_reason]);
            AuditLogger::log('opportunity_invitation.declined', $invitation, [], $user);
        }

        return response()->json(['data' => new OpportunityResource($invitation->fresh('entry.assignment'))]);
    }

    private function findOwnedInvitation(Request $request, string $id): OpportunityInvitation
    {
        /** @var ExpertUser $user */
        $user = $request->user();
        $profile = $user->profile()->firstOrFail();

        return OpportunityInvitation::whereHas(
            'entry',
            fn ($q) => $q->where('expert_pool_profile_id', $profile->id)
        )->findOrFail($id);
    }
}
