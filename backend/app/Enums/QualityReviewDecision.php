<?php

namespace App\Enums;

/** Section 13 "RESULT SEEKERS QUALITY REVIEW" — the reviewer's decision before a shortlist is proposed. */
enum QualityReviewDecision: string
{
    case Approved = 'approved';
    case Rejected = 'rejected';
    case ChangesRequested = 'changes_requested';
}
