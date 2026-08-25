<?php

namespace App\Enums;

/**
 * talent-expert.txt, "VERIFICATION SYSTEM" — the exact 9 progressive
 * levels named there, verbatim. Stored on ExpertPoolProfile as a
 * denormalized "highest confirmed level" cache (kept in sync whenever a
 * VerificationCheck is completed) so recruiter search can filter by level
 * without joining every VerificationCase per candidate — the ledger of
 * individual checks remains the source of truth in VerificationCase /
 * VerificationCheck. This is deliberately a separate concept from
 * ExpertPoolProfileStatus (profile-review lifecycle) — see the readiness
 * report's CRITICAL note under analysis point 9.
 */
enum VerificationLevel: string
{
    case Registered = 'registered';
    case ProfileReviewed = 'profile_reviewed';
    case IdentityVerified = 'identity_verified';
    case CredentialsVerified = 'credentials_verified';
    case ExperienceVerified = 'experience_verified';
    case ReferencesVerified = 'references_verified';
    case SkillsAssessed = 'skills_assessed';
    case PreviouslyDeployed = 'previously_deployed';
    case PreferredExpert = 'preferred_expert';

    public function label(): string
    {
        return match ($this) {
            self::Registered => 'Registered',
            self::ProfileReviewed => 'Profile Reviewed',
            self::IdentityVerified => 'Identity Verified',
            self::CredentialsVerified => 'Credentials Verified',
            self::ExperienceVerified => 'Experience Verified',
            self::ReferencesVerified => 'References Verified',
            self::SkillsAssessed => 'Skills Assessed',
            self::PreviouslyDeployed => 'Previously Deployed',
            self::PreferredExpert => 'Preferred Expert',
        };
    }
}
