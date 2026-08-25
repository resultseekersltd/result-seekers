<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\CandidateEvaluation;
use App\Models\DataRelease;
use App\Models\OrganisationUser;
use App\Models\User;

class CandidateEvaluationPolicy
{
    /** An organisation may only evaluate a release addressed to their own tenant — the same boundary DataReleasePolicy enforces. */
    public function create(OrganisationUser $actor, DataRelease $release): bool
    {
        return $actor->organisation_id === $release->released_to_organisation_id
            && $actor->hasPermission(Permission::CandidateEvaluationManage);
    }

    public function view(User|OrganisationUser $actor, CandidateEvaluation $evaluation): bool
    {
        if ($actor instanceof OrganisationUser) {
            return $actor->organisation_id === $evaluation->release->released_to_organisation_id
                && $actor->hasPermission(Permission::CandidateEvaluationManage);
        }

        return $actor->hasPermission(Permission::RecruitmentAssignmentManage)
            || $actor->hasPermission(Permission::CandidateReleaseApprove);
    }

    /** Only the evaluator who wrote it may edit their own evaluation — not the whole organisation's team. */
    public function update(OrganisationUser $actor, CandidateEvaluation $evaluation): bool
    {
        return $actor->id === $evaluation->organisation_user_id
            && $actor->hasPermission(Permission::CandidateEvaluationManage);
    }
}
