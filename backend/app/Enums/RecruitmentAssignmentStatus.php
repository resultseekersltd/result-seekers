<?php

namespace App\Enums;

/**
 * talent-expert.txt "RECRUITMENT ASSIGNMENT WORKFLOW" — the assignment's
 * own terminal states, verbatim ("Assignment opened" / "completed" /
 * "cancelled" / "archived"). The stages in between (sourcing, longlisting,
 * screening, consent, shortlisting, ...) belong to CandidatePipelineEntry,
 * not to the assignment itself.
 */
enum RecruitmentAssignmentStatus: string
{
    case Opened = 'opened';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case Archived = 'archived';
}
