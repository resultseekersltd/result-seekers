<?php

namespace App\Http\Controllers\Api\Organisation;

use App\Enums\TalentRequestStatus;
use App\Http\Controllers\Concerns\HasPaginatedResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Organisation\StoreTalentRequestRequest;
use App\Http\Resources\Organisation\TalentRequestResource;
use App\Models\OrganisationUser;
use App\Models\TalentRequest;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Intake + tracking only — talent-expert.txt's "ORGANISATION TALENT
 * REQUEST" through the request's own status (submitted/under_review/
 * clarification_requested/accepted/declined/closed). Does not implement
 * the 28-stage recruitment assignment workflow (approved Option A).
 */
class TalentRequestController extends Controller
{
    use HasPaginatedResponse;

    public function index(Request $request): JsonResponse
    {
        /** @var OrganisationUser $actor */
        $actor = $request->user();

        $requests = TalentRequest::where('organisation_id', $actor->organisation_id)
            ->latest()
            ->paginate(25);

        return $this->paginatedResponse($requests, TalentRequestResource::class);
    }

    public function store(StoreTalentRequestRequest $request): JsonResponse
    {
        /** @var OrganisationUser $actor */
        $actor = $request->user();
        $this->authorize('create', TalentRequest::class);

        $talentRequest = TalentRequest::create([
            ...$request->validated(),
            'organisation_id' => $actor->organisation_id,
            'organisation_user_id' => $actor->id,
            'status' => TalentRequestStatus::Submitted,
            'submitted_at' => now(),
        ]);

        AuditLogger::log('talent_request.submitted', $talentRequest, [], $actor);

        return response()->json(['data' => new TalentRequestResource($talentRequest)], 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $talentRequest = TalentRequest::findOrFail($id);
        $this->authorize('view', $talentRequest);

        return response()->json(['data' => new TalentRequestResource($talentRequest)]);
    }
}
