<?php

namespace App\Enums;

/**
 * Terminal outcomes — Section 16 "professional interest/decline" and
 * "PIPELINE AND CANDIDATE MANAGEMENT"'s "record rejection reasons...
 * record withdrawal... record no response." A null outcome means the
 * pipeline entry is still active at whatever `stage` it has reached.
 *
 * `Placed` (Phase 4) is the one positive terminal value — set only once
 * both the Organisation and the Professional have independently
 * confirmed the Placement (see Placement::checkAndMarkConfirmed()),
 * never by a single party's action alone.
 */
enum CandidatePipelineOutcome: string
{
    case NotSelected = 'not_selected';
    case DeclinedByCandidate = 'declined_by_candidate';
    case Withdrawn = 'withdrawn';
    case NoResponse = 'no_response';
    case Placed = 'placed';
}
