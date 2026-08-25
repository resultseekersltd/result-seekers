<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\Organisation;
use App\Models\OrganisationUser;
use App\Models\User;

/**
 * Tenant isolation lives here, not just in query scoping — every action
 * re-checks the object itself, not only "did the query start from the
 * right organisation_id" (defense in depth, per the readiness report's
 * workspace/tenant-isolation section and expert-network.txt's explicit
 * "enforce tenant isolation at the server and database-query levels...
 * do not rely only on frontend filtering").
 */
class OrganisationPolicy
{
    public function view(User|OrganisationUser $actor, Organisation $organisation): bool
    {
        if ($actor instanceof OrganisationUser) {
            return $actor->organisation_id === $organisation->id;
        }

        return $actor->hasPermission(Permission::OrganisationView) || $actor->hasPermission(Permission::OrganisationManage);
    }

    public function update(User|OrganisationUser $actor, Organisation $organisation): bool
    {
        if ($actor instanceof OrganisationUser) {
            return $actor->organisation_id === $organisation->id
                && $actor->hasPermission(Permission::OrganisationProfileManage);
        }

        return $actor->hasPermission(Permission::OrganisationManage);
    }

    /** Only RS staff may transition organisation verification status — never the organisation itself. */
    public function verify(User $actor, Organisation $organisation): bool
    {
        return $actor->hasPermission(Permission::OrganisationVerify);
    }

    public function manageUsers(User|OrganisationUser $actor, Organisation $organisation): bool
    {
        if ($actor instanceof OrganisationUser) {
            return $actor->organisation_id === $organisation->id
                && $actor->hasPermission(Permission::OrganisationUsersManage);
        }

        return $actor->hasPermission(Permission::OrganisationManage);
    }
}
