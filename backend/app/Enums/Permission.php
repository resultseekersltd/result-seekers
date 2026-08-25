<?php

namespace App\Enums;

/**
 * Permission vocabulary derived directly from the "should be able to" /
 * "must not be able to" capability lists per role in talent-expert.txt
 * (Organisation Representative, Result Seekers Recruiter, Verifier,
 * Recruitment Manager, Super Admin), scoped to what Phase 1 + Phase 2
 * actually build. Not the full eventual vocabulary — permissions for
 * modules not yet implemented (assessments, interviews, contracts, ...)
 * are intentionally absent rather than pre-declared for nothing to check.
 */
enum Permission: string
{
    // Organisation management (RS side)
    case OrganisationManage = 'organisation.manage';
    case OrganisationVerify = 'organisation.verify';
    case OrganisationView = 'organisation.view';

    // Organisation's own workspace (organisation side)
    case OrganisationUsersManage = 'organisation.users.manage';
    case OrganisationProfileManage = 'organisation.profile.manage';

    // Talent requests
    case TalentRequestCreate = 'talent-request.create';
    case TalentRequestViewOwn = 'talent-request.view-own';
    case TalentRequestManage = 'talent-request.manage'; // RS side: review/assign/close any request

    // Recruiter-facing expert discovery
    case TalentSearch = 'talent.search';

    // Verification
    case VerificationReview = 'verification.review';
    case VerificationApprove = 'verification.approve';

    // Recruitment assignments / campaigns (Phase 2)
    case RecruitmentAssignmentManage = 'recruitment-assignment.manage'; // create, own, reassign

    // Candidate pipeline (Phase 2) — add candidates, screen, longlist, prepare shortlist, invite
    case CandidatePipelineManage = 'candidate-pipeline.manage';

    // Result Seekers Quality Review gate before a shortlist is proposed (Phase 2)
    case QualityReviewPerform = 'quality-review.perform';

    // Approval to actually release identifiable candidate data to an organisation (Phase 2)
    case CandidateReleaseApprove = 'candidate-release.approve';

    // Organisation-side candidate review (Phase 2)
    case ReleasedCandidateView = 'released-candidate.view-own';

    // Audit
    case AuditView = 'audit.view';

    // Phase 3: verification case lifecycle (opening a case — reviewing/
    // approving individual checks already exists via VerificationReview/
    // VerificationApprove above)
    case VerificationCaseManage = 'verification-case.manage';

    // Phase 3: assessments — "Recruiters should be able to: Schedule assessments" (talent-expert.txt)
    case AssessmentManage = 'assessment.manage';

    // Phase 3: interviews — "Recruiters should be able to: Schedule interviews" (talent-expert.txt)
    case InterviewManage = 'interview.manage';

    // Phase 3: reference checks — "Verifiers should be able to: Review references" (talent-expert.txt)
    case ReferenceCheckManage = 'reference-check.manage';

    // Phase 3: organisation-side structured candidate scoring — "Score
    // shortlisted candidates... Record hiring decisions" (Organisation
    // Representative role, talent-expert.txt)
    case CandidateEvaluationManage = 'candidate-evaluation.manage';

    public function label(): string
    {
        return match ($this) {
            self::OrganisationManage => 'Manage organisations',
            self::OrganisationVerify => 'Verify organisations',
            self::OrganisationView => 'View organisations',
            self::OrganisationUsersManage => 'Manage organisation team members',
            self::OrganisationProfileManage => 'Manage own organisation profile',
            self::TalentRequestCreate => 'Create talent requests',
            self::TalentRequestViewOwn => 'View own organisation\'s talent requests',
            self::TalentRequestManage => 'Manage talent requests',
            self::TalentSearch => 'Search the professional database',
            self::VerificationReview => 'Review verification checks',
            self::VerificationApprove => 'Approve or reject verification checks',
            self::RecruitmentAssignmentManage => 'Manage recruitment assignments',
            self::CandidatePipelineManage => 'Manage candidate pipeline',
            self::QualityReviewPerform => 'Perform quality review',
            self::CandidateReleaseApprove => 'Approve candidate release',
            self::ReleasedCandidateView => 'View own organisation\'s released candidates',
            self::AuditView => 'View audit logs',
            self::VerificationCaseManage => 'Open verification cases',
            self::AssessmentManage => 'Manage candidate assessments',
            self::InterviewManage => 'Manage candidate interviews',
            self::ReferenceCheckManage => 'Manage reference checks',
            self::CandidateEvaluationManage => 'Evaluate released candidates',
        };
    }
}
