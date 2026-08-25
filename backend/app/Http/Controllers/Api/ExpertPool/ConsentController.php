<?php

namespace App\Http\Controllers\Api\ExpertPool;

use App\Enums\CandidateConsentStatus;
use App\Enums\CandidatePipelineOutcome;
use App\Enums\CandidatePipelineStage;
use App\Http\Controllers\Concerns\HasPaginatedResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\ExpertPool\ConsentResource;
use App\Models\CandidateConsent;
use App\Models\ExpertUser;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Section 17 "CANDIDATE CONSENT" made operational. Every query scoped to
 * the caller's own ExpertPoolProfile — no ID lets a professional act on
 * another professional's consent record.
 */
class ConsentController extends Controller
{
    use HasPaginatedResponse;

    public function index(Request $request): JsonResponse
    {
        /** @var ExpertUser $user */
        $user = $request->user();
        $profile = $user->profile()->firstOrFail();

        $consents = CandidateConsent::where('expert_pool_profile_id', $profile->id)->latest()->paginate(25);

        return $this->paginatedResponse($consents, ConsentResource::class);
    }

    public function respond(Request $request, string $id): JsonResponse
    {
        $request->validate(['response' => ['required', 'string', 'in:grant,decline']]);

        $consent = $this->findOwnedConsent($request, $id);

        if ($consent->status !== CandidateConsentStatus::Requested) {
            return response()->json(['message' => 'This consent request has already been responded to.'], 422);
        }

        /** @var ExpertUser $user */
        $user = $request->user();

        if ($request->response === 'grant') {
            $consent->update([
                'status' => CandidateConsentStatus::Consented,
                'responded_at' => now(),
                'consented_at' => now(),
            ]);
            $consent->pipelineEntry?->transitionTo(CandidatePipelineStage::Consented, null, 'Candidate consented to release.');
            AuditLogger::log('candidate_consent.granted', $consent, [], $user);
        } else {
            $consent->update([
                'status' => CandidateConsentStatus::Declined,
                'responded_at' => now(),
                'declined_at' => now(),
            ]);
            $consent->pipelineEntry?->update(['outcome' => CandidatePipelineOutcome::DeclinedByCandidate]);
            AuditLogger::log('candidate_consent.declined', $consent, [], $user);
        }

        return response()->json(['data' => new ConsentResource($consent->fresh())]);
    }

    /**
     * talent-expert.txt: "Allow consent withdrawal where legally
     * possible." Only meaningful before release has already occurred —
     * withdrawing after release doesn't retroactively un-share data
     * already sent, it only prevents further reliance on this consent.
     */
    public function withdraw(Request $request, string $id): JsonResponse
    {
        $consent = $this->findOwnedConsent($request, $id);

        if ($consent->status !== CandidateConsentStatus::Consented) {
            return response()->json(['message' => 'Only a granted consent can be withdrawn.'], 422);
        }

        /** @var ExpertUser $user */
        $user = $request->user();

        $consent->update(['status' => CandidateConsentStatus::Withdrawn, 'withdrawn_at' => now()]);

        AuditLogger::log('candidate_consent.withdrawn', $consent, [], $user);

        return response()->json(['data' => new ConsentResource($consent->fresh())]);
    }

    private function findOwnedConsent(Request $request, string $id): CandidateConsent
    {
        /** @var ExpertUser $user */
        $user = $request->user();
        $profile = $user->profile()->firstOrFail();

        return CandidateConsent::where('expert_pool_profile_id', $profile->id)->findOrFail($id);
    }
}
