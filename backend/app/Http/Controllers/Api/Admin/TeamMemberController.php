<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HasPaginatedResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TeamMemberRequest;
use App\Http\Resources\TeamMemberResource;
use App\Models\TeamMember;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;

class TeamMemberController extends Controller
{
    use HasPaginatedResponse;

    public function index(): JsonResponse
    {
        return $this->paginatedResponse(TeamMember::query()->orderBy('order')->paginate(50), TeamMemberResource::class);
    }

    public function store(TeamMemberRequest $request): JsonResponse
    {
        $member = TeamMember::create($request->validated());
        AuditLogger::log('team_member.created', $member, $request->validated());

        return response()->json(['data' => new TeamMemberResource($member)], 201);
    }

    // Parameter name must be snake_case to match the apiResource-generated
    // {team_member} route wildcard for implicit model binding.
    public function update(TeamMemberRequest $request, TeamMember $team_member): JsonResponse
    {
        $team_member->update($request->validated());
        AuditLogger::log('team_member.updated', $team_member, $request->validated());

        return response()->json(['data' => new TeamMemberResource($team_member)]);
    }

    public function destroy(TeamMember $team_member): JsonResponse
    {
        AuditLogger::log('team_member.deleted', $team_member);
        $team_member->delete();

        return response()->json(['message' => 'Team member deleted.']);
    }
}
