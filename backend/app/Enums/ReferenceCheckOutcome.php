<?php

namespace App\Enums;

enum ReferenceCheckOutcome: string
{
    case Positive = 'positive';
    case Negative = 'negative';
    case Mixed = 'mixed';
    case Inconclusive = 'inconclusive';

    public function label(): string
    {
        return match ($this) {
            self::Positive => 'Positive',
            self::Negative => 'Negative',
            self::Mixed => 'Mixed',
            self::Inconclusive => 'Inconclusive',
        };
    }
}
