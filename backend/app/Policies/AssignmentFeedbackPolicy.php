<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\AssignmentFeedback;
use App\Models\CandidatePipelineEntry;
use App\Models\ExpertUser;
use App\Models\OrganisationUser;
use App\Models\Placement;
use App\Models\User;

/**
 * Approved Phase 4 rule: "Neither party should see the other's submitted
 * feedback until both required feedback submissions have been completed,
 * unless an explicitly authorized RS administrator/manager needs access
 * for operational purposes." Mirrors InterviewScorecardPolicy's own-
 * always / others-once-a-condition-is-met shape, but the trigger here is
 * "both feedback rows exist" rather than "interview completed."
 */
class AssignmentFeedbackPolicy
{
    public function submitAsOrganisation(OrganisationUser $actor, Placement $placement): bool
    {
        return $actor->hasPermission(Permission::ReleasedCandidateView) && $this->releasedToOrganisation($actor, $placement);
    }

    public function submitAsProfessional(ExpertUser $actor, Placement $placement): bool
    {
        return $this->belongsToProfessional($actor, $placement);
    }

    public function view(User|OrganisationUser|ExpertUser $actor, AssignmentFeedback $feedback): bool
    {
        $isOwnFeedback = $feedback->submitter_type === $actor::class && (int) $feedback->submitter_id === (int) $actor->id;

        if ($isOwnFeedback) {
            return true;
        }

        if ($actor instanceof User) {
            // RS staff must own/oversee the underlying assignment first —
            // never just "any RS staff member" — same isolation boundary
            // every other Phase 2/3/4 policy enforces. Manager-tier then
            // gets early operational access even before both sides have
            // submitted (the approved scope's explicit "unless an
            // explicitly authorized RS administrator/manager needs
            // access" carve-out); a plain owning Recruiter waits for the
            // same "both submitted" gate as everyone else.
            if (! $this->ownsOrOversees($actor, $feedback->placement->pipelineEntry)) {
                return false;
            }

            if ($actor->hasPermission(Permission::QualityReviewPerform)) {
                return true;
            }
        }

        return $feedback->placement->feedback()->count() >= 2;
    }

    private function ownsOrOversees(User $actor, CandidatePipelineEntry $entry): bool
    {
        if (! $actor->hasPermission(Permission::CandidatePipelineManage)) {
            return false;
        }

        if ($actor->hasPermission(Permission::QualityReviewPerform)) {
            return true;
        }

        return $actor->id === $entry->assignment->recruiter_id;
    }

    private function releasedToOrganisation(OrganisationUser $actor, Placement $placement): bool
    {
        return $placement->pipelineEntry->consents()
            ->whereHas('releases', fn ($q) => $q->where('released_to_organisation_id', $actor->organisation_id))
            ->exists();
    }

    private function belongsToProfessional(ExpertUser $actor, Placement $placement): bool
    {
        return $actor->profile()->where('id', $placement->pipelineEntry->expert_pool_profile_id)->exists();
    }
}
