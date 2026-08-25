<?php

namespace App\Enums;

/**
 * talent-expert.txt "ASSESSMENTS" — candidate status through the
 * assessment lifecycle. `type` itself (multiple_choice/written/file/
 * technical/practical/language/custom) is deliberately kept as a plain
 * validated string on the model, not a closed enum — same reasoning as
 * VerificationCheck::check_type: the document's list is illustrative
 * ("Custom assessment templates"), not exhaustive.
 */
enum AssessmentStatus: string
{
    case Assigned = 'assigned';
    case InProgress = 'in_progress';
    case Submitted = 'submitted';
    case UnderReview = 'under_review';
    case Reviewed = 'reviewed';
    case Expired = 'expired';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Assigned => 'Assigned',
            self::InProgress => 'In Progress',
            self::Submitted => 'Submitted',
            self::UnderReview => 'Under Review',
            self::Reviewed => 'Reviewed',
            self::Expired => 'Expired',
            self::Cancelled => 'Cancelled',
        };
    }
}
