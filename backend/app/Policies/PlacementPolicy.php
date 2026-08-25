<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\CandidatePipelineEntry;
use App\Models\ExpertUser;
use App\Models\OrganisationUser;
use App\Models\Placement;
use App\Models\User;

/**
 * Approved Phase 4 ownership rule: "Owning Recruiter: allowed.
 * Recruitment Manager: allowed. Super Admin: allowed. Verifier: not
 * allowed" — identical shape to CandidatePipelineEntryPolicy's
 * ownsOrOversees, since CandidatePipelineManage is a Recruiter/
 * RecruitmentManager-only permission and Verifier never holds it.
 */
class PlacementPolicy
{
    public function create(User $actor, CandidatePipelineEntry $entry): bool
    {
        return $this->ownsOrOversees($actor, $entry);
    }

    public function view(User|OrganisationUser|ExpertUser $actor, Placement $placement): bool
    {
        if ($actor instanceof OrganisationUser) {
            return $actor->hasPermission(Permission::ReleasedCandidateView) && $this->releasedToOrganisation($actor, $placement);
        }

        if ($actor instanceof ExpertUser) {
            return $this->belongsToProfessional($actor, $placement);
        }

        return $this->ownsOrOversees($actor, $placement->pipelineEntry);
    }

    public function manage(User $actor, Placement $placement): bool
    {
        return $this->ownsOrOversees($actor, $placement->pipelineEntry);
    }

    public function confirmAsOrganisation(OrganisationUser $actor, Placement $placement): bool
    {
        return $actor->hasPermission(Permission::ReleasedCandidateView) && $this->releasedToOrganisation($actor, $placement);
    }

    public function confirmAsProfessional(ExpertUser $actor, Placement $placement): bool
    {
        return $this->belongsToProfessional($actor, $placement);
    }

    private function ownsOrOversees(User $actor, CandidatePipelineEntry $entry): bool
    {
        if (! $actor->hasPermission(Permission::CandidatePipelineManage)) {
            return false;
        }

        if ($actor->hasPermission(Permission::QualityReviewPerform)) {
            return true; // manager-tier oversight
        }

        return $actor->id === $entry->assignment->recruiter_id;
    }

    /** Same boundary InterviewPolicy already enforces: visible to the organisation only once the candidate has actually been released to them. */
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
