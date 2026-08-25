<?php

namespace App\Http\Controllers\Api\Organisation;

use App\Http\Controllers\Concerns\HasPaginatedResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\Organisation\ReleasedCandidateResource;
use App\Models\DataRelease;
use App\Models\OrganisationCandidateComment;
use App\Models\OrganisationUser;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Section 19 "ORGANISATION REVIEW WORKSPACE". Every query starts from
 * $request->user()->organisation_id — the organisation can never browse
 * DataRelease rows belonging to another tenant, and the Policy re-checks
 * the object on show/comment as defense in depth (matching the pattern
 * already established for talent-requests in Phase 1).
 */
class ReleasedCandidateController extends Controller
{
    use HasPaginatedResponse;

    public function index(Request $request): JsonResponse
    {
        /** @var OrganisationUser $actor */
        $actor = $request->user();

        $releases = DataRelease::where('released_to_organisation_id', $actor->organisation_id)
            ->withCount('comments')
            ->latest()
            ->paginate(25);

        // Every RS-staff view of client data must be auditable
        // (expert-network.txt) — this mirrors OrganisationController's
        // own show()-level logging.
        AuditLogger::log('organisation.released_candidates_viewed', null, ['organisation_id' => $actor->organisation_id], $actor);

        return $this->paginatedResponse($releases, ReleasedCandidateResource::class);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $release = DataRelease::withCount('comments')->findOrFail($id);
        $this->authorize('view', $release);

        return response()->json(['data' => new ReleasedCandidateResource($release)]);
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $request->validate(['organisation_status' => ['required', 'string', 'in:pending,interested,not_interested']]);

        $release = DataRelease::findOrFail($id);
        $this->authorize('view', $release);

        $release->update(['organisation_status' => $request->organisation_status]);

        /** @var OrganisationUser $actor */
        $actor = $request->user();
        AuditLogger::log('organisation.candidate_status_updated', $release, ['status' => $request->organisation_status], $actor);

        return response()->json(['data' => new ReleasedCandidateResource($release->fresh())]);
    }

    public function addComment(Request $request, string $id): JsonResponse
    {
        $request->validate(['comment' => ['required', 'string']]);

        $release = DataRelease::findOrFail($id);
        $this->authorize('comment', $release);

        /** @var OrganisationUser $actor */
        $actor = $request->user();

        $comment = OrganisationCandidateComment::create([
            'data_release_id' => $release->id,
            'organisation_user_id' => $actor->id,
            'comment' => $request->comment,
        ]);

        AuditLogger::log('organisation.candidate_comment_added', $release, [], $actor);

        return response()->json(['data' => ['id' => $comment->id, 'comment' => $comment->comment, 'created_at' => $comment->created_at->toIso8601String()]], 201);
    }
}
