<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\CandidatePipelineEntry;
use App\Models\Interview;
use App\Models\OrganisationUser;
use App\Models\User;

class InterviewPolicy
{
    public function viewAny(User $actor, CandidatePipelineEntry $entry): bool
    {
        return $this->ownsOrOversees($actor, $entry);
    }

    public function create(User $actor, CandidatePipelineEntry $entry): bool
    {
        return $this->ownsOrOversees($actor, $entry);
    }

    public function view(User|OrganisationUser $actor, Interview $interview): bool
    {
        if ($actor instanceof OrganisationUser) {
            return $actor->hasPermission(Permission::ReleasedCandidateView)
                && $this->releasedToOrganisation($actor, $interview);
        }

        return $this->ownsOrOversees($actor, $interview->pipelineEntry);
    }

    public function manage(User $actor, Interview $interview): bool
    {
        return $this->ownsOrOversees($actor, $interview->pipelineEntry);
    }

    /** A panelist may always submit their own scorecard, regardless of ownership of the wider assignment. */
    public function scoreAsPanelist(User|OrganisationUser $actor, Interview $interview): bool
    {
        return $interview->panelMembers()
            ->where('panelist_type', $actor::class)
            ->where('panelist_id', $actor->id)
            ->exists();
    }

    private function ownsOrOversees(User $actor, CandidatePipelineEntry $entry): bool
    {
        if (! $actor->hasPermission(Permission::InterviewManage)) {
            return false;
        }

        if ($actor->hasPermission(Permission::QualityReviewPerform)) {
            return true;
        }

        return $actor->id === $entry->assignment->recruiter_id;
    }

    /**
     * The organisation may only see an interview once the same candidate
     * has actually been released to them — never before, matching "do not
     * expose candidate-identifying information before controlled
     * release."
     */
    private function releasedToOrganisation(OrganisationUser $actor, Interview $interview): bool
    {
        return $interview->pipelineEntry->consents()
            ->whereHas('releases', fn ($q) => $q->where('released_to_organisation_id', $actor->organisation_id))
            ->exists();
    }
}
