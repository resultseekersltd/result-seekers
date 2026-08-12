<?php

namespace App\Enums;

/**
 * Distinguishes indicators with an actual number to animate (StatCard on
 * the frontend) from qualitative statements that don't have one (e.g.
 * "Offices in Abuja and Kano") — see 05_Content_and_Product_Specification.md
 * §3 for the approved list, which contains both kinds.
 */
enum TrustIndicatorType: string
{
    case Numeric = 'numeric';
    case Qualitative = 'qualitative';
}
