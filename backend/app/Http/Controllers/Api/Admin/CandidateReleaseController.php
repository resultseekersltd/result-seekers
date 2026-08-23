<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\CandidateConsentStatus;
use App\Enums\CandidatePipelineStage;
use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\CandidateConsent;
use App\Models\DataRelease;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Section 18 "CONTROLLED DATA RELEASE" — the gate the entire Phase 2
 * privacy model exists to protect. Requires: (1) CandidateReleaseApprove
 * permission (Recruitment Manager / Super Admin only — "Approve candidate
 * release" is a Recruitment Manager capability, not a Recruiter one), and
 * (2) an actually-granted CandidateConsent for this exact pipeline entry.
 * `released_fields` is built from an explicit allowlist — never the full
 * ExpertPoolProfile — and never includes the candidate's real name (the
 * source document's own release-field list has no name in it, only a
 * "candidate reference").
 */
class CandidateReleaseController extends Controller
{
    private const ALLOWED_FIELDS = [
        'candidate_reference',
        'professional_title',
        'years_experience',
        'highest_qualification',
        'country',
        'state',
        'disciplines',
        'industries',
        'languages',
        'verification_level',
    ];

    public function store(Request $request, string $consentId): JsonResponse
    {
        /** @var User $actor */
        $actor = $request->user();

        if (! $actor->hasPermission(Permission::CandidateReleaseApprove)) {
            throw new AccessDeniedHttpException('You do not have permission to approve candidate release.');
        }

        $consent = CandidateConsent::with(['profile.disciplines', 'pipelineEntry'])->findOrFail($consentId);

        if ($consent->status !== CandidateConsentStatus::Consented) {
            return response()->json(['message' => 'This candidate has not granted consent for release.'], 422);
        }

        $profile = $consent->profile;

        $releasedFields = [
            'candidate_reference' => 'CAND-'.now()->format('Y').'-'.strtoupper(substr($profile->id.$consent->id, -6)),
            'professional_title' => $profile->professional_title,
            'years_experience' => $profile->years_experience,
            'highest_qualification' => $profile->highest_qualification,
            'country' => $profile->country,
            'state' => $profile->state,
            'disciplines' => $profile->disciplines->pluck('name'),
            'industries' => $profile->industries,
            'languages' => $profile->languages,
            'verification_level' => $profile->verification_level?->value,
        ];

        $release = DataRelease::create([
            'candidate_consent_id' => $consent->id,
            'released_to_organisation_id' => $consent->organisation_id,
            'released_by' => $actor->id,
            'released_fields' => $releasedFields,
            'purpose' => $consent->purpose,
            'released_at' => now(),
        ]);

        $consent->pipelineEntry?->transitionTo(CandidatePipelineStage::Released, $actor, 'Candidate released to organisation.');

        AuditLogger::log('candidate_data.released', $release, ['fields' => self::ALLOWED_FIELDS], $actor);

        return response()->json(['data' => ['release_id' => $release->id]], 201);
    }
}
