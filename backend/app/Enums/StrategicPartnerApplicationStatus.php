<?php

namespace App\Enums;

enum StrategicPartnerApplicationStatus: string
{
    case Pending = 'pending';
    case InReview = 'in_review';
    case Approved = 'approved';
    case Rejected = 'rejected';
}
