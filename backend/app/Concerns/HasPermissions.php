<?php

namespace App\Concerns;

use App\Enums\OrganisationRole;
use App\Enums\Permission;
use App\Enums\RsRole;
use App\Support\RolePermissions;

/**
 * Applied to `User` and `OrganisationUser` (not `ExpertUser` — experts
 * have profile-scoped self-access only, not this RS/organisation
 * permission vocabulary). Named `hasPermission()` rather than `can()`
 * deliberately, so it never shadows Laravel's own `Authorizable::can()`
 * used for Policy checks (`$user->can('update', $organisation)`) — the
 * two are complementary: this trait answers "does this role generally
 * have this capability", Policies answer "may this specific user act on
 * this specific object" (tenant scoping, ownership, etc).
 */
trait HasPermissions
{
    public function hasPermission(Permission $permission): bool
    {
        $role = $this->role;

        return match (true) {
            $role instanceof RsRole => in_array($permission, RolePermissions::forRsRole($role), true),
            $role instanceof OrganisationRole => in_array($permission, RolePermissions::forOrganisationRole($role), true),
            default => false,
        };
    }
}
