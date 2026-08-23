<?php

namespace App\Enums;

/** talent-expert.txt: interview scorecard "Overall recommendation" — kept structured, not free text, per the platform's "explainable, never opaque" scoring principle. */
enum InterviewRecommendation: string
{
    case StrongYes = 'strong_yes';
    case Yes = 'yes';
    case No = 'no';
    case StrongNo = 'strong_no';

    public function label(): string
    {
        return match ($this) {
            self::StrongYes => 'Strong Yes',
            self::Yes => 'Yes',
            self::No => 'No',
            self::StrongNo => 'Strong No',
        };
    }
}
