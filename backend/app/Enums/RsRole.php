<?php

namespace App\Enums;

/**
 * Result Seekers staff roles, per talent-expert.txt's "PLATFORM USERS AND
 * ROLES" — exactly the four RS-side roles the source documents name
 * (Recruiter, Verifier, Recruitment Manager, Super Admin). `SuperAdmin`
 * deliberately backs the pre-existing literal `'admin'` string already
 * stored on every existing admin account — no data migration, no rename;
 * the existing `role === 'admin'` check in EnsureIsAdmin keeps working
 * unchanged, and this enum treats that same value as the top permission
 * tier. "CEO" and "Talent Officer" are not implemented — neither document
 * names them as required roles (see the Phase 1 readiness report, §21/§22).
 */
enum RsRole: string
{
    case SuperAdmin = 'admin';
    case RecruitmentManager = 'recruitment_manager';
    case Recruiter = 'recruiter';
    case Verifier = 'verifier';

    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::RecruitmentManager => 'Recruitment Manager',
            self::Recruiter => 'Result Seekers Recruiter',
            self::Verifier => 'Verifier',
        };
    }
}
