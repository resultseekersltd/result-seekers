<?php

namespace App\Enums;

/** Section 11 "SCREENING" — eligibility/availability/conflict/quality, recorded as one recruiter decision per pipeline entry. */
enum ScreeningDecision: string
{
    case Eligible = 'eligible';
    case NotEligible = 'not_eligible';
    case NeedsClarification = 'needs_clarification';
}
