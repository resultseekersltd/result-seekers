<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\ReferenceCheck;
use App\Models\User;

/**
 * No per-case assignment scoping — mirrors VerificationCasePolicy's own
 * documented limitation ("Verifiers should only see information necessary
 * for their assigned verification tasks" is not yet enforced at the
 * per-case level in this codebase; Phase 3 does not introduce that gap
 * fresh, it inherits the same already-accepted one).
 */
class ReferenceCheckPolicy
{
    public function view(User $actor, ReferenceCheck $referenceCheck): bool
    {
        if ($actor->hasPermission(Permission::ReferenceCheckManage)) {
            return true;
        }

        return $actor->hasPermission(Permission::CandidatePipelineManage)
            && $actor->id === $referenceCheck->pipelineEntry->assignment->recruiter_id;
    }

    public function manage(User $actor, ReferenceCheck $referenceCheck): bool
    {
        return $actor->hasPermission(Permission::ReferenceCheckManage);
    }
}
