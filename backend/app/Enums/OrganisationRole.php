<?php

namespace App\Enums;

/**
 * Organisation-side roles. The source documents name exactly one —
 * "Organisation Representative" — with a fully enumerated allow/deny list.
 * "Organisation Admin", "Hiring Manager", and "Evaluation Panel" (from an
 * earlier, pre-document architecture draft) are not implemented; they
 * don't appear in either requirement document (readiness report, §21).
 * Kept as an enum rather than a hardcoded string so a future documented
 * role is a single new case, not a schema change.
 */
enum OrganisationRole: string
{
    case Representative = 'organisation_representative';

    public function label(): string
    {
        return match ($this) {
            self::Representative => 'Organisation Representative',
        };
    }
}
