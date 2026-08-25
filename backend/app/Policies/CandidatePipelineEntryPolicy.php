<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\CandidatePipelineEntry;
use App\Models\User;

/**
 * Every check re-verifies against the entry's owning assignment/recruiter,
 * not just "does this role generally have pipeline permission" — a
 * Recruiter with CandidatePipelineManage still may not touch another
 * recruiter's pipeline entries unless they also hold the manager-tier
 * oversight permission (QualityReviewPerform, RecruitmentManager/
 * SuperAdmin only).
 */
class CandidatePipelineEntryPolicy
{
    public function view(User $actor, CandidatePipelineEntry $entry): bool
    {
        return $this->ownsOrOversees($actor, $entry);
    }

    public function manage(User $actor, CandidatePipelineEntry $entry): bool
    {
        return $this->ownsOrOversees($actor, $entry);
    }

    public function performQualityReview(User $actor, CandidatePipelineEntry $entry): bool
    {
        return $actor->hasPermission(Permission::QualityReviewPerform);
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
}
