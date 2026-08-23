<?php

namespace App\Support;

use App\Enums\OrganisationRole;
use App\Enums\Permission;
use App\Enums\RsRole;

/**
 * Static role → permission mapping, deliberately plain PHP rather than a
 * database table (roles table / permission table / pivot) — the vocabulary
 * is a fixed, documented list for Phase 1, not something that needs
 * runtime editing, so a code-defined mapping is simpler, diffable in git,
 * and avoids introducing dynamic-RBAC infrastructure nothing yet needs.
 * See the readiness report's RBAC architecture section.
 *
 * Grants are traced to specific capability-list lines in talent-expert.txt:
 * - RecruitmentManager -> OrganisationVerify: the document assigns
 *   organisation verification only generically ("Manual Result Seekers
 *   approval"); granting it to Recruitment Manager (rather than Recruiter
 *   or Verifier) is an inference from that role's other "Approve..." grants
 *   ("Approve recruitment strategies", "Approve sensitive... workflows"),
 *   not a literal quote — flagged as such in the Phase 1 completion report.
 */
class RolePermissions
{
    /** @return list<Permission> */
    public static function forRsRole(RsRole $role): array
    {
        return match ($role) {
            // Super Admin bypasses this map entirely — see HasPermissions::can().
            RsRole::SuperAdmin => Permission::cases(),
            RsRole::RecruitmentManager => [
                Permission::TalentRequestManage,
                Permission::OrganisationView,
                Permission::OrganisationVerify,
                Permission::AuditView,
                // "Approve recruitment strategies... Approve shortlists...
                // Review recruitment quality... Approve candidate release...
                // Approve assignment closure" (talent-expert.txt).
                Permission::RecruitmentAssignmentManage,
                Permission::CandidatePipelineManage,
                Permission::QualityReviewPerform,
                Permission::CandidateReleaseApprove,
                // Phase 3: Recruitment Manager holds oversight across every
                // evaluation sub-process, matching its existing role as the
                // approver/escalation point for the whole pipeline.
                Permission::VerificationCaseManage,
                Permission::AssessmentManage,
                Permission::InterviewManage,
                Permission::ReferenceCheckManage,
            ],
            RsRole::Recruiter => [
                Permission::TalentSearch,
                Permission::TalentRequestManage,
                // "Create recruitment assignments... Build longlists...
                // Build shortlists... Invite professionals... Request
                // candidate consent... Conduct preliminary screening"
                // (talent-expert.txt) — note Recruiter does NOT get
                // CandidateReleaseApprove: the document gives "Approve
                // candidate release" only to Recruitment Manager, a
                // deliberate governance checkpoint before identifiable
                // data leaves Result Seekers.
                Permission::RecruitmentAssignmentManage,
                Permission::CandidatePipelineManage,
                // Phase 3: "Recruiters should be able to: ... Request
                // verification... Schedule assessments... Schedule
                // interviews... Record outcomes" (talent-expert.txt).
                // Deliberately no ReferenceCheckManage — the document puts
                // "Review references" under Verifier, not Recruiter.
                Permission::VerificationCaseManage,
                Permission::AssessmentManage,
                Permission::InterviewManage,
            ],
            RsRole::Verifier => [
                Permission::VerificationReview,
                Permission::VerificationApprove,
                // Phase 3: "Verifiers should be able to: ... Review
                // references" (talent-expert.txt).
                Permission::ReferenceCheckManage,
            ],
        };
    }

    /** @return list<Permission> */
    public static function forOrganisationRole(OrganisationRole $role): array
    {
        return match ($role) {
            OrganisationRole::Representative => [
                Permission::TalentRequestCreate,
                Permission::TalentRequestViewOwn,
                Permission::OrganisationUsersManage,
                Permission::OrganisationProfileManage,
                Permission::ReleasedCandidateView,
                // Phase 3: "Score shortlisted candidates... Add private
                // internal comments... Submit interview feedback... Record
                // hiring decisions" (talent-expert.txt).
                Permission::CandidateEvaluationManage,
            ],
        };
    }
}
