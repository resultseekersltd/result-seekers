<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\RecruitmentAssignment;
use App\Models\User;

class RecruitmentAssignmentPolicy
{
    public function create(User $actor): bool
    {
        return $actor->hasPermission(Permission::RecruitmentAssignmentManage);
    }

    /** Any RS staff with pipeline/assignment visibility may view — narrower per-candidate privacy is enforced by CandidatePipelineEntryPolicy. */
    public function view(User $actor, RecruitmentAssignment $assignment): bool
    {
        return $actor->hasPermission(Permission::RecruitmentAssignmentManage)
            || $actor->hasPermission(Permission::QualityReviewPerform);
    }

    /** Reassignment/closure — Recruiter (their own) or Recruitment Manager/Super Admin (any). */
    public function manage(User $actor, RecruitmentAssignment $assignment): bool
    {
        if (! $actor->hasPermission(Permission::RecruitmentAssignmentManage)) {
            return false;
        }

        return $actor->id === $assignment->recruiter_id || $actor->hasPermission(Permission::QualityReviewPerform);
    }
}
