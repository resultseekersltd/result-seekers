<?php

namespace App\Enums;

/**
 * talent-expert.txt, "CANDIDATE VISIBILITY" — the exact 6 states named
 * there, verbatim. Default is Private (set at the migration column
 * default) — no existing profile becomes searchable by an act of
 * migration; an expert must actively change this.
 */
enum ExpertVisibility: string
{
    case Private = 'private';
    case RsInternal = 'rs_internal';
    case AnonymousMatching = 'anonymous_matching';
    case ApprovedOpportunities = 'approved_opportunities';
    case TemporarilyUnavailable = 'temporarily_unavailable';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Private => 'Private',
            self::RsInternal => 'Visible only to Result Seekers recruiters',
            self::AnonymousMatching => 'Available for anonymous matching',
            self::ApprovedOpportunities => 'Available for approved opportunities',
            self::TemporarilyUnavailable => 'Temporarily unavailable',
            self::Archived => 'Archived',
        };
    }

    /** Whether a profile in this state may ever appear in RS-recruiter search results. */
    public function isDiscoverable(): bool
    {
        return match ($this) {
            self::RsInternal, self::AnonymousMatching, self::ApprovedOpportunities => true,
            self::Private, self::TemporarilyUnavailable, self::Archived => false,
        };
    }
}
