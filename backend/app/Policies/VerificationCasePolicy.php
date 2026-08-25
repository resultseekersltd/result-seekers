<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\User;
use App\Models\VerificationCase;

/**
 * talent-expert.txt: "Verifiers should only see information necessary
 * for their assigned verification tasks." Phase 1 doesn't yet implement
 * per-case assignment, so this is scoped to the Verifier role generally —
 * assignment-level restriction is deferred with the rest of Verifier
 * workflow automation, not silently promised here.
 */
class VerificationCasePolicy
{
    /** Phase 3: opening a case is a pipeline-progression action ("Recruiters... Request verification" — talent-expert.txt), distinct from reviewing/approving its checks. */
    public function create(User $actor): bool
    {
        return $actor->hasPermission(Permission::VerificationCaseManage);
    }

    public function view(User $actor, VerificationCase $case): bool
    {
        return $actor->hasPermission(Permission::VerificationReview);
    }

    public function review(User $actor, VerificationCase $case): bool
    {
        return $actor->hasPermission(Permission::VerificationReview);
    }

    public function approve(User $actor, VerificationCase $case): bool
    {
        return $actor->hasPermission(Permission::VerificationApprove);
    }
}
