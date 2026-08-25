<?php

namespace App\Enums;

/**
 * TalentRequest's own lifecycle. Phase 1 shipped a narrower, request-intake
 * -only version of this enum (submitted/under_review/clarification_
 * requested/accepted/declined/closed) with its own docblock calling it
 * "foundation only." Phase 2 makes the request lifecycle operational —
 * feeding into a RecruitmentAssignment — so this evolves to the set
 * Phase 2's own scope specifies: draft/submitted/under_review/
 * clarification_requested/assigned/in_recruitment/completed/cancelled.
 * `assigned` is set once a recruiter is attached (see
 * TalentRequest::assigned_recruiter_id); `in_recruitment` once a
 * RecruitmentAssignment is opened against this request. Still
 * deliberately NOT the 28-stage assignment-level workflow — that detail
 * lives on RecruitmentAssignment/CandidatePipelineEntry instead.
 */
enum TalentRequestStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';
    case UnderReview = 'under_review';
    case ClarificationRequested = 'clarification_requested';
    case Assigned = 'assigned';
    case InRecruitment = 'in_recruitment';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
}
