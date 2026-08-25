<?php

namespace App\Enums;

/**
 * talent-expert.txt, "CANDIDATE CONSENT AND DATA RELEASE" — the decision
 * states from that 10-step process. This is schema/state only in Phase 1;
 * the operational request/response workflow is explicitly deferred.
 */
enum CandidateConsentStatus: string
{
    case Requested = 'requested';
    case Consented = 'consented';
    case Declined = 'declined';
    case Withdrawn = 'withdrawn';
}
