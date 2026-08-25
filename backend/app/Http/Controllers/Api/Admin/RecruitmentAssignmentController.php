<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\RecruitmentAssignmentStatus;
use App\Enums\TalentRequestStatus;
use App\Http\Controllers\Concerns\HasPaginatedResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\RecruitmentAssignmentResource;
use App\Models\RecruitmentAssignment;
use App\Models\TalentRequest;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Section 7 "RECRUITMENT ASSIGNMENT / CAMPAIGN". Creating an assignment is
 * how a TalentRequest moves from intake into active recruitment
 * (TalentRequestStatus::InRecruitment) — the point talent-expert.txt's
 * 28-stage list calls "Assignment opened".
 */
class RecruitmentAssignmentController extends Controller
{
    use HasPaginatedResponse;

    public function index(Request $request): JsonResponse
    {
        $query = RecruitmentAssignment::with(['talentRequest', 'organisation', 'recruiter'])->withCount('pipelineEntries');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($recruiterId = $request->query('recruiter_id')) {
            $query->where('recruiter_id', $recruiterId);
        }

        $assignments = $query->latest()->paginate(25);

        return $this->paginatedResponse($assignments, RecruitmentAssignmentResource::class);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $assignment = RecruitmentAssignment::with(['talentRequest', 'organisation', 'recruiter'])
            ->withCount('pipelineEntries')
            ->findOrFail($id);

        $this->authorize('view', $assignment);

        return response()->json(['data' => new RecruitmentAssignmentResource($assignment)]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', RecruitmentAssignment::class);

        $request->validate([
            'talent_request_id' => ['required', 'string', 'exists:talent_requests,id'],
            'recruiter_id' => ['sometimes', 'integer', 'exists:users,id'],
        ]);

        $talentRequest = TalentRequest::findOrFail($request->talent_request_id);

        /** @var User $actor */
        $actor = $request->user();
        $recruiterId = $request->integer('recruiter_id') ?: $actor->id;

        $assignment = RecruitmentAssignment::create([
            'talent_request_id' => $talentRequest->id,
            'organisation_id' => $talentRequest->organisation_id,
            'recruiter_id' => $recruiterId,
            'status' => RecruitmentAssignmentStatus::Opened,
            'opened_at' => now(),
        ]);

        $talentRequest->update([
            'status' => TalentRequestStatus::InRecruitment,
            'assigned_recruiter_id' => $talentRequest->assigned_recruiter_id ?? $recruiterId,
        ]);

        AuditLogger::log('recruitment_assignment.opened', $assignment, ['talent_request_id' => $talentRequest->id], $actor);

        return response()->json(['data' => new RecruitmentAssignmentResource($assignment->load(['talentRequest', 'organisation', 'recruiter']))], 201);
    }

    /** Reassignment — Recruitment Manager/Super Admin, or the current owning recruiter. */
    public function reassign(Request $request, string $id): JsonResponse
    {
        $request->validate(['recruiter_id' => ['required', 'integer', 'exists:users,id']]);

        $assignment = RecruitmentAssignment::findOrFail($id);
        $this->authorize('manage', $assignment);

        $previous = $assignment->recruiter_id;
        $assignment->update(['recruiter_id' => $request->integer('recruiter_id')]);

        AuditLogger::log('recruitment_assignment.reassigned', $assignment, [
            'from_recruiter_id' => $previous,
            'to_recruiter_id' => $assignment->recruiter_id,
        ]);

        return response()->json(['data' => new RecruitmentAssignmentResource($assignment->fresh(['talentRequest', 'organisation', 'recruiter']))]);
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $request->validate(['status' => ['required', 'string', 'in:completed,cancelled,archived']]);

        $assignment = RecruitmentAssignment::findOrFail($id);
        $this->authorize('manage', $assignment);

        $data = ['status' => $request->status];
        $data[$request->status.'_at'] = now();
        $assignment->update($data);

        if (in_array($request->status, ['completed', 'cancelled'], true)) {
            $assignment->talentRequest->update([
                'status' => $request->status === 'completed' ? TalentRequestStatus::Completed : TalentRequestStatus::Cancelled,
            ]);
        }

        AuditLogger::log('recruitment_assignment.status_changed', $assignment, ['status' => $request->status]);

        return response()->json(['data' => new RecruitmentAssignmentResource($assignment->fresh(['talentRequest', 'organisation', 'recruiter']))]);
    }
}
