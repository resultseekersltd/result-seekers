<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\OrganisationUser;
use App\Models\TalentRequest;
use App\Models\User;

class TalentRequestPolicy
{
    public function create(OrganisationUser $actor): bool
    {
        return $actor->hasPermission(Permission::TalentRequestCreate);
    }

    public function view(User|OrganisationUser $actor, TalentRequest $talentRequest): bool
    {
        if ($actor instanceof OrganisationUser) {
            return $actor->organisation_id === $talentRequest->organisation_id
                && $actor->hasPermission(Permission::TalentRequestViewOwn);
        }

        return $actor->hasPermission(Permission::TalentRequestManage);
    }

    /** RS-side status transitions only — the organisation cannot self-approve or self-close its own request. */
    public function manage(User $actor, TalentRequest $talentRequest): bool
    {
        return $actor->hasPermission(Permission::TalentRequestManage);
    }
}
