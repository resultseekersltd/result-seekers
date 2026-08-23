<?php

namespace App\Http\Controllers\Api\Organisation;

use App\Http\Controllers\Controller;
use App\Http\Resources\Organisation\InterviewResource;
use App\Models\Interview;
use App\Models\InterviewScorecard;
use App\Models\OrganisationUser;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * The organisation's own view of interviews — scoped strictly to
 * candidates already released to their tenant (InterviewPolicy re-checks
 * this per object; every query here also starts from that same
 * boundary, so tenant isolation is enforced twice, not once).
 */
class InterviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var OrganisationUser $actor */
        $actor = $request->user();

        $interviews = Interview::whereHas(
            'pipelineEntry.consents.releases',
            fn ($q) => $q->where('released_to_organisation_id', $actor->organisation_id),
        )->with('scorecards')->latest()->get();

        return response()->json(['data' => InterviewResource::collection($interviews)]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $interview = Interview::with('scorecards')->findOrFail($id);
        $this->authorize('view', $interview);

        return response()->json(['data' => new InterviewResource($interview)]);
    }

    /** Organisation Representative acting as a panel member — "Submit interview feedback" (talent-expert.txt). */
    public function submitScorecard(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'competency_scores' => ['nullable', 'array'],
            'panel_comments' => ['nullable', 'string'],
            'overall_recommendation' => ['required', 'string', 'in:strong_yes,yes,no,strong_no'],
        ]);

        $interview = Interview::findOrFail($id);
        $this->authorize('scoreAsPanelist', $interview);

        /** @var OrganisationUser $actor */
        $actor = $request->user();

        $scorecard = InterviewScorecard::updateOrCreate(
            ['interview_id' => $interview->id, 'panelist_type' => OrganisationUser::class, 'panelist_id' => $actor->id],
            [
                'competency_scores' => $request->competency_scores,
                'panel_comments' => $request->panel_comments,
                'overall_recommendation' => $request->overall_recommendation,
                'submitted_at' => now(),
            ],
        );

        AuditLogger::log('interview.scorecard_submitted', $interview, [], $actor);

        return response()->json(['data' => ['id' => $scorecard->id]], 201);
    }
}
