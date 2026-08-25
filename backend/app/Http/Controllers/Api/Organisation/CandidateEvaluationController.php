<?php

namespace App\Http\Controllers\Api\Organisation;

use App\Http\Controllers\Controller;
use App\Http\Resources\Organisation\CandidateEvaluationResource;
use App\Models\CandidateEvaluation;
use App\Models\DataRelease;
use App\Models\OrganisationUser;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Phase 3 "ORGANISATION EVALUATION" — structured scoring on top of the
 * existing DataRelease (status + comments already shipped in Phase 2).
 * "Preserve the existing rule: ORGANISATIONS DO NOT SEARCH THE ENTIRE
 * EXPERT DATABASE" — every evaluation is created against an existing,
 * already-authorized DataRelease; there is no path to evaluate a
 * candidate that was never released.
 */
class CandidateEvaluationController extends Controller
{
    public function index(Request $request, string $releaseId): JsonResponse
    {
        $release = DataRelease::findOrFail($releaseId);
        $this->authorize('view', $release);

        $evaluations = CandidateEvaluation::with('organisationUser')
            ->where('data_release_id', $release->id)
            ->latest()
            ->get();

        return response()->json(['data' => CandidateEvaluationResource::collection($evaluations)]);
    }

    public function store(Request $request, string $releaseId): JsonResponse
    {
        $request->validate([
            'score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'criteria_notes' => ['nullable', 'string'],
            'recommendation' => ['nullable', 'string', 'max:255'],
            'final_outcome' => ['nullable', 'string', 'in:pending,selected,not_selected'],
        ]);

        $release = DataRelease::findOrFail($releaseId);
        $this->authorize('create', [CandidateEvaluation::class, $release]);

        /** @var OrganisationUser $actor */
        $actor = $request->user();

        $evaluation = CandidateEvaluation::updateOrCreate(
            ['data_release_id' => $release->id, 'organisation_user_id' => $actor->id],
            [
                'score' => $request->score,
                'criteria_notes' => $request->criteria_notes,
                'recommendation' => $request->recommendation,
                'final_outcome' => $request->final_outcome,
            ],
        );

        AuditLogger::log('candidate_evaluation.recorded', $evaluation, ['final_outcome' => $request->final_outcome], $actor);

        return response()->json(['data' => new CandidateEvaluationResource($evaluation->fresh('organisationUser'))], 201);
    }

    public function update(Request $request, string $releaseId, string $evaluationId): JsonResponse
    {
        $request->validate([
            'score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'criteria_notes' => ['nullable', 'string'],
            'recommendation' => ['nullable', 'string', 'max:255'],
            'final_outcome' => ['nullable', 'string', 'in:pending,selected,not_selected'],
        ]);

        $evaluation = CandidateEvaluation::where('data_release_id', $releaseId)->findOrFail($evaluationId);
        $this->authorize('update', $evaluation);

        $evaluation->update($request->only(['score', 'criteria_notes', 'recommendation', 'final_outcome']));

        /** @var OrganisationUser $actor */
        $actor = $request->user();
        AuditLogger::log('candidate_evaluation.recorded', $evaluation, ['final_outcome' => $evaluation->final_outcome?->value], $actor);

        return response()->json(['data' => new CandidateEvaluationResource($evaluation->fresh('organisationUser'))]);
    }
}
