<?php

namespace App\Http\Controllers\Api\ExpertPool;

use App\Http\Controllers\Controller;
use App\Http\Resources\ExpertPool\InterviewResource;
use App\Models\ExpertUser;
use App\Models\Interview;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** The professional's own interview queue — read-only plus a confirm action, never any scorecard/panel data. */
class InterviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var ExpertUser $user */
        $user = $request->user();
        $profile = $user->profile()->firstOrFail();

        $interviews = Interview::whereHas('pipelineEntry', fn ($q) => $q->where('expert_pool_profile_id', $profile->id))
            ->latest()
            ->get();

        return response()->json(['data' => InterviewResource::collection($interviews)]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        return response()->json(['data' => new InterviewResource($this->findOwnedInterview($request, $id))]);
    }

    public function confirm(Request $request, string $id): JsonResponse
    {
        $interview = $this->findOwnedInterview($request, $id);
        $interview->update(['candidate_confirmed_at' => now()]);

        /** @var ExpertUser $user */
        $user = $request->user();
        AuditLogger::log('interview.confirmed_by_candidate', $interview, [], $user);

        return response()->json(['data' => new InterviewResource($interview->fresh())]);
    }

    private function findOwnedInterview(Request $request, string $id): Interview
    {
        /** @var ExpertUser $user */
        $user = $request->user();
        $profile = $user->profile()->firstOrFail();

        return Interview::whereHas('pipelineEntry', fn ($q) => $q->where('expert_pool_profile_id', $profile->id))
            ->findOrFail($id);
    }
}
