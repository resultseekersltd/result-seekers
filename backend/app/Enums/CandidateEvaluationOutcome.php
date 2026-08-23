<?php

namespace App\Enums;

/**
 * "Record hiring decisions" (Organisation Representative role,
 * talent-expert.txt) — a plain reporting data point, not an offer/
 * contract/placement workflow, which remains out of Phase 3 scope.
 */
enum CandidateEvaluationOutcome: string
{
    case Pending = 'pending';
    case Selected = 'selected';
    case NotSelected = 'not_selected';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Selected => 'Selected',
            self::NotSelected => 'Not Selected',
        };
    }
}
