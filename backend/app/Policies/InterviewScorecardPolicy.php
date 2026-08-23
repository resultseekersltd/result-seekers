<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\InterviewScorecard;
use App\Models\OrganisationUser;
use App\Models\User;

/**
 * talent-expert.txt: "Do not expose one panel member's private scoring to
 * another before submission if independent scoring is required."
 * Approved Phase 3 judgment call #2: a panelist always sees their own
 * scorecard; sees a co-panelist's only once the parent Interview is
 * `completed`.
 */
class InterviewScorecardPolicy
{
    public function view(User|OrganisationUser $actor, InterviewScorecard $scorecard): bool
    {
        $isOwnScorecard = $scorecard->panelist_type === $actor::class && (int) $scorecard->panelist_id === (int) $actor->id;

        if ($isOwnScorecard) {
            return true;
        }

        if ($actor instanceof User && $actor->hasPermission(Permission::QualityReviewPerform)) {
            return true; // manager-tier oversight, same as every other Phase 2/3 entry point
        }

        return $scorecard->interview->status->value === 'completed';
    }
}
