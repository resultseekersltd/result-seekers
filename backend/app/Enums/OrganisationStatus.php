<?php

namespace App\Enums;

/**
 * talent-expert.txt, "ORGANISATION REGISTRATION AND VERIFICATION" —
 * the exact 8 statuses named there, verbatim.
 */
enum OrganisationStatus: string
{
    case Draft = 'draft';
    case PendingVerification = 'pending_verification';
    case ClarificationRequested = 'clarification_requested';
    case Verified = 'verified';
    case Rejected = 'rejected';
    case Suspended = 'suspended';
    case Restricted = 'restricted';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::PendingVerification => 'Pending Verification',
            self::ClarificationRequested => 'Clarification Requested',
            self::Verified => 'Verified',
            self::Rejected => 'Rejected',
            self::Suspended => 'Suspended',
            self::Restricted => 'Restricted',
            self::Archived => 'Archived',
        };
    }
}
