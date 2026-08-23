<?php

namespace App\Enums;

/** talent-expert.txt, "VERIFICATION SYSTEM" — the exact 10 supported statuses, verbatim. */
enum VerificationCheckStatus: string
{
    case NotStarted = 'not_started';
    case Pending = 'pending';
    case UnderReview = 'under_review';
    case ClarificationRequested = 'clarification_requested';
    case Verified = 'verified';
    case PartiallyVerified = 'partially_verified';
    case UnableToVerify = 'unable_to_verify';
    case Rejected = 'rejected';
    case Expired = 'expired';
    case Revoked = 'revoked';
}
