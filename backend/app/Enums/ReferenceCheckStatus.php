<?php

namespace App\Enums;

enum ReferenceCheckStatus: string
{
    case NotStarted = 'not_started';
    case Requested = 'requested';
    case Contacted = 'contacted';
    case Completed = 'completed';
    case UnableToReach = 'unable_to_reach';
    case Declined = 'declined';

    public function label(): string
    {
        return match ($this) {
            self::NotStarted => 'Not Started',
            self::Requested => 'Requested',
            self::Contacted => 'Contacted',
            self::Completed => 'Completed',
            self::UnableToReach => 'Unable to Reach',
            self::Declined => 'Declined',
        };
    }
}
