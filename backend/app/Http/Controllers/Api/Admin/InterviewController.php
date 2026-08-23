<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\InterviewStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\InterviewResource;
use App\Models\CandidatePipelineEntry;
use App\Models\Interview;
use App\Models\InterviewPanelMember;
use App\Models\InterviewScorecard;
use App\Models\OrganisationUser;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * Phase 3 "INTERVIEW MANAGEMENT", nested under the owning pipeline entry.
 * Result Seekers (Recruiter/Recruitment Manager) always creates and owns
 * the record — approved Phase 3 judgment call #3.
 */
class InterviewController extends Controller
{
    private const PANELIST_TYPES = [
        'user' => User::class,
        'organisation_user' => OrganisationUser::class,
    ];

    public function index(Request $request, string $assignmentId, string $entryId): JsonResponse
    {
        $entry = CandidatePipelineEntry::where('recruitment_assignment_id', $assignmentId)->findOrFail($entryId);
        $this->authorize('viewAny', [Interview::class, $entry]);

        $interviews = Interview::with(['creator', 'panelMembers.panelist', 'scorecards.panelist'])
            ->where('candidate_pipeline_entry_id', $entry->id)
            ->latest()
            ->get()
            ->each(fn (Interview $interview) => $this->filterVisibleScorecards($interview, $request->user()));

        return response()->json(['data' => InterviewResource::collection($interviews)]);
    }

    public function store(Request $request, string $assignmentId, string $entryId): JsonResponse
    {
        $request->validate([
            'type' => ['required', 'string', 'max:100'],
            'scheduled_at' => ['nullable', 'date'],
            'timezone' => ['nullable', 'string', 'max:100'],
            'location_or_link' => ['nullable', 'string', 'max:255'],
        ]);

        $entry = CandidatePipelineEntry::where('recruitment_assignment_id', $assignmentId)->findOrFail($entryId);
        $this->authorize('create', [Interview::class, $entry]);

        /** @var User $actor */
        $actor = $request->user();

        $interview = Interview::create([
            'candidate_pipeline_entry_id' => $entry->id,
            'type' => $request->type,
            'scheduled_at' => $request->scheduled_at,
            'timezone' => $request->timezone,
            'location_or_link' => $request->location_or_link,
            'status' => InterviewStatus::Scheduled,
            'created_by' => $actor->id,
        ]);

        AuditLogger::log('interview.scheduled', $interview, ['type' => $interview->type], $actor);

        return response()->json(['data' => new InterviewResource($interview)], 201);
    }

    public function show(Request $request, string $assignmentId, string $entryId, string $interviewId): JsonResponse
    {
        $entry = CandidatePipelineEntry::where('recruitment_assignment_id', $assignmentId)->findOrFail($entryId);
        $interview = Interview::with(['creator', 'panelMembers.panelist', 'scorecards.panelist'])
            ->where('candidate_pipeline_entry_id', $entry->id)
            ->findOrFail($interviewId);

        $this->authorize('view', $interview);
        $this->filterVisibleScorecards($interview, $request->user());

        return response()->json(['data' => new InterviewResource($interview)]);
    }

    /** talent-expert.txt: "Do not expose one panel member's private scoring to another before submission." */
    private function filterVisibleScorecards(Interview $interview, User $actor): void
    {
        $interview->setRelation(
            'scorecards',
            $interview->scorecards->filter(fn (InterviewScorecard $scorecard) => Gate::forUser($actor)->allows('view', $scorecard))->values(),
        );
    }

    public function updateStatus(Request $request, string $assignmentId, string $entryId, string $interviewId): JsonResponse
    {
        $request->validate(['status' => ['required', 'string', 'in:confirmed,completed,cancelled,no_show,rescheduled']]);

        $entry = CandidatePipelineEntry::where('recruitment_assignment_id', $assignmentId)->findOrFail($entryId);
        $interview = Interview::where('candidate_pipeline_entry_id', $entry->id)->findOrFail($interviewId);
        $this->authorize('manage', $interview);

        $interview->update(['status' => $request->status]);

        /** @var User $actor */
        $actor = $request->user();
        AuditLogger::log('interview.status_changed', $interview, ['status' => $request->status], $actor);

        return response()->json(['data' => new InterviewResource($interview->fresh(['creator', 'panelMembers.panelist', 'scorecards.panelist']))]);
    }

    public function addPanelMember(Request $request, string $assignmentId, string $entryId, string $interviewId): JsonResponse
    {
        $request->validate([
            'panelist_type' => ['required', 'string', 'in:user,organisation_user'],
            'panelist_id' => ['required', 'integer'],
            'role' => ['nullable', 'string', 'max:100'],
        ]);

        $entry = CandidatePipelineEntry::where('recruitment_assignment_id', $assignmentId)->findOrFail($entryId);
        $interview = Interview::where('candidate_pipeline_entry_id', $entry->id)->findOrFail($interviewId);
        $this->authorize('manage', $interview);

        $panelistClass = self::PANELIST_TYPES[$request->panelist_type];
        $panelistClass::findOrFail($request->panelist_id);

        $member = InterviewPanelMember::firstOrCreate([
            'interview_id' => $interview->id,
            'panelist_type' => $panelistClass,
            'panelist_id' => $request->integer('panelist_id'),
        ], [
            'role' => $request->role,
            'invited_at' => now(),
        ]);

        /** @var User $actor */
        $actor = $request->user();
        AuditLogger::log('interview.panel_member_added', $interview, ['panelist_type' => $request->panelist_type], $actor);

        return response()->json(['data' => ['id' => $member->id]], 201);
    }

    /** Result Seekers panelist submits their own private scorecard. */
    public function submitScorecard(Request $request, string $assignmentId, string $entryId, string $interviewId): JsonResponse
    {
        $request->validate([
            'competency_scores' => ['nullable', 'array'],
            'panel_comments' => ['nullable', 'string'],
            'overall_recommendation' => ['required', 'string', 'in:strong_yes,yes,no,strong_no'],
            'conflict_of_interest' => ['sometimes', 'boolean'],
            'conflict_of_interest_notes' => ['nullable', 'string'],
        ]);

        $entry = CandidatePipelineEntry::where('recruitment_assignment_id', $assignmentId)->findOrFail($entryId);
        $interview = Interview::where('candidate_pipeline_entry_id', $entry->id)->findOrFail($interviewId);
        $this->authorize('scoreAsPanelist', $interview);

        /** @var User $actor */
        $actor = $request->user();

        $scorecard = InterviewScorecard::updateOrCreate(
            ['interview_id' => $interview->id, 'panelist_type' => User::class, 'panelist_id' => $actor->id],
            [
                'competency_scores' => $request->competency_scores,
                'panel_comments' => $request->panel_comments,
                'overall_recommendation' => $request->overall_recommendation,
                'conflict_of_interest' => $request->boolean('conflict_of_interest'),
                'conflict_of_interest_notes' => $request->conflict_of_interest_notes,
                'submitted_at' => now(),
            ],
        );

        AuditLogger::log('interview.scorecard_submitted', $interview, [], $actor);

        return response()->json(['data' => ['id' => $scorecard->id]], 201);
    }
}
