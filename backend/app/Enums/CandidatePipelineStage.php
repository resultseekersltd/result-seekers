<?php

namespace App\Enums;

/**
 * talent-expert.txt "PIPELINE AND CANDIDATE MANAGEMENT" / Phase 2 prompt
 * §10 — the documented candidate progression, verbatim. Represents the
 * furthest point reached; a terminal negative is recorded separately via
 * CandidatePipelineOutcome so it doesn't overwrite how far the candidate
 * actually got (e.g. "declined at invitation" while stage stays "invited").
 */
enum CandidatePipelineStage: string
{
    case Identified = 'identified';
    case Screening = 'screening';
    case Longlisted = 'longlisted';
    case QualityReview = 'quality_review';
    case Shortlisted = 'shortlisted';
    case Invited = 'invited';
    case Interested = 'interested';
    case ConsentPending = 'consent_pending';
    case Consented = 'consented';
    case Released = 'released';

    public function label(): string
    {
        return match ($this) {
            self::Identified => 'Identified',
            self::Screening => 'Screening',
            self::Longlisted => 'Longlisted',
            self::QualityReview => 'Quality Review',
            self::Shortlisted => 'Shortlisted',
            self::Invited => 'Invited',
            self::Interested => 'Interested',
            self::ConsentPending => 'Consent Pending',
            self::Consented => 'Consented',
            self::Released => 'Released',
        };
    }
}
