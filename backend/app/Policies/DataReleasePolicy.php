<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\DataRelease;
use App\Models\OrganisationUser;
use App\Models\User;

class DataReleasePolicy
{
    /**
     * Section 18/19: the organisation must never access a release
     * belonging to another organisation — re-checked against the object,
     * not just "is this an authenticated org user."
     */
    public function view(OrganisationUser|User $actor, DataRelease $release): bool
    {
        if ($actor instanceof OrganisationUser) {
            return $actor->organisation_id === $release->released_to_organisation_id
                && $actor->hasPermission(Permission::ReleasedCandidateView);
        }

        return $actor->hasPermission(Permission::CandidateReleaseApprove)
            || $actor->hasPermission(Permission::RecruitmentAssignmentManage);
    }

    public function comment(OrganisationUser $actor, DataRelease $release): bool
    {
        return $actor->organisation_id === $release->released_to_organisation_id
            && $actor->hasPermission(Permission::ReleasedCandidateView);
    }
}
