<?php

namespace App\Enums;

/**
 * Expert Pool profile workflow. `Incomplete`/`Complete` are system-derived
 * from ExpertPoolProfile::completionPercentage() (never set directly);
 * `Submitted` is set by the expert via a "Submit for Review" action once
 * complete; `UnderReview`/`Approved`/`Rejected`/`Suspended` are admin-only
 * transitions (see Api\Admin\ExpertPoolController) — no admin UI exists
 * yet to drive them interactively, but the backend supports them.
 */
enum ExpertPoolProfileStatus: string
{
    case Incomplete = 'incomplete';
    case Complete = 'complete';
    case Submitted = 'submitted';
    case UnderReview = 'under_review';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Suspended = 'suspended';
}
