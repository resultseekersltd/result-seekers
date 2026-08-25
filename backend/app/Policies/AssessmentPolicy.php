<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\Assessment;
use App\Models\CandidatePipelineEntry;
use App\Models\User;

/**
 * Same ownership shape as CandidatePipelineEntryPolicy: a Recruiter may
 * only manage assessments on assignments they own; manager-tier (holds
 * QualityReviewPerform, i.e. Recruitment Manager/Super Admin) oversees
 * everything. `create`/`viewAny` take the CandidatePipelineEntry directly
 * since no Assessment exists yet at that point.
 */
class AssessmentPolicy
{
    public function viewAny(User $actor, CandidatePipelineEntry $entry): bool
    {
        return $this->ownsOrOversees($actor, $entry);
    }

    public function create(User $actor, CandidatePipelineEntry $entry): bool
    {
        return $this->ownsOrOversees($actor, $entry);
    }

    public function view(User $actor, Assessment $assessment): bool
    {
        return $this->ownsOrOversees($actor, $assessment->pipelineEntry);
    }

    public function manage(User $actor, Assessment $assessment): bool
    {
        return $this->ownsOrOversees($actor, $assessment->pipelineEntry);
    }

    private function ownsOrOversees(User $actor, CandidatePipelineEntry $entry): bool
    {
        if (! $actor->hasPermission(Permission::AssessmentManage)) {
            return false;
        }

        if ($actor->hasPermission(Permission::QualityReviewPerform)) {
            return true;
        }

        return $actor->id === $entry->assignment->recruiter_id;
    }
}
