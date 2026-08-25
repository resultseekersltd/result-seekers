<?php

namespace App\Enums;

/** Section 15 "OPPORTUNITY INVITATION". */
enum OpportunityInvitationStatus: string
{
    case Pending = 'pending';
    case Sent = 'sent';
    case Viewed = 'viewed';
    case Accepted = 'accepted';
    case Declined = 'declined';
    case Expired = 'expired';
    case Withdrawn = 'withdrawn';
}
