<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\TalentRequestStatus;
use App\Http\Controllers\Concerns\HasPaginatedResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AdminTalentRequestResource;
use App\Models\TalentRequest;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TalentRequestController extends Controller
{
    use HasPaginatedResponse;

    public function index(Request $request): JsonResponse
    {
        $query = TalentRequest::with(['organisation', 'requester', 'assignedRecruiter']);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($organisationId = $request->query('organisation_id')) {
            $query->where('organisation_id', $organisationId);
        }

        $requests = $query->latest()->paginate(25);

        return $this->paginatedResponse($requests, AdminTalentRequestResource::class);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $talentRequest = TalentRequest::with(['organisation', 'requester', 'assignedRecruiter'])->findOrFail($id);
        $this->authorize('view', $talentRequest);

        return response()->json(['data' => new AdminTalentRequestResource($talentRequest)]);
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'string', 'in:under_review,clarification_requested,assigned,in_recruitment,completed,cancelled'],
        ]);

        $talentRequest = TalentRequest::findOrFail($id);
        $this->authorize('manage', $talentRequest);

        $talentRequest->update(['status' => $request->status]);

        AuditLogger::log('talent_request.status_changed', $talentRequest, ['status' => $request->status]);

        return response()->json(['data' => new AdminTalentRequestResource($talentRequest->fresh(['organisation', 'requester', 'assignedRecruiter']))]);
    }

    /**
     * talent-expert.txt §"ORGANISATION TALENT REQUEST": "Allow assignment
     * of a recruiter." Sets TalentRequestStatus::Assigned. Distinct from
     * RecruitmentAssignment::recruiter_id, which owns the campaign once
     * one is opened — this is the earlier "who is handling intake" step.
     */
    public function assignRecruiter(Request $request, string $id): JsonResponse
    {
        $request->validate(['recruiter_id' => ['required', 'integer', 'exists:users,id']]);

        $talentRequest = TalentRequest::findOrFail($id);
        $this->authorize('manage', $talentRequest);

        $recruiter = User::findOrFail($request->integer('recruiter_id'));

        $talentRequest->update([
            'assigned_recruiter_id' => $recruiter->id,
            'status' => TalentRequestStatus::Assigned,
        ]);

        AuditLogger::log('talent_request.recruiter_assigned', $talentRequest, ['recruiter_id' => $recruiter->id]);

        return response()->json(['data' => new AdminTalentRequestResource($talentRequest->fresh(['organisation', 'requester', 'assignedRecruiter']))]);
    }
}
