<?php

namespace App\Enums;

/**
 * Mirrors the Expert Network "Application workflow" in
 * 03_Feature_Specification.md: Submit profile → Verification → Review →
 * Approval → Database inclusion. "Database inclusion" is modelled as the
 * creation of an ExpertProfile row once an application is Approved.
 */
enum ExpertApplicationStatus: string
{
    case Pending = 'pending';
    case Verifying = 'verifying';
    case InReview = 'in_review';
    case Approved = 'approved';
    case Rejected = 'rejected';
}
