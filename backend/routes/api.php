<?php

use App\Http\Controllers\Api\Admin\AdminSubmissionsController;
use App\Http\Controllers\Api\Admin\ArticleCategoryController as AdminArticleCategoryController;
use App\Http\Controllers\Api\Admin\ArticleController as AdminArticleController;
use App\Http\Controllers\Api\Admin\AssessmentController as AdminAssessmentController;
use App\Http\Controllers\Api\Admin\AssignmentFeedbackController as AdminAssignmentFeedbackController;
use App\Http\Controllers\Api\Admin\AuditLogController;
use App\Http\Controllers\Api\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Api\Admin\CandidatePipelineController;
use App\Http\Controllers\Api\Admin\CandidateReleaseController;
use App\Http\Controllers\Api\Admin\CourseCategoryController as AdminCourseCategoryController;
use App\Http\Controllers\Api\Admin\CourseController as AdminCourseController;
use App\Http\Controllers\Api\Admin\ExpertPoolController as AdminExpertPoolController;
use App\Http\Controllers\Api\Admin\InterviewController as AdminInterviewController;
use App\Http\Controllers\Api\Admin\MediaController;
use App\Http\Controllers\Api\Admin\OfficeController;
use App\Http\Controllers\Api\Admin\OpportunityInvitationController;
use App\Http\Controllers\Api\Admin\OrganisationController as AdminOrganisationController;
use App\Http\Controllers\Api\Admin\OrganisationUserController as AdminOrganisationUserController;
use App\Http\Controllers\Api\Admin\PlacementController as AdminPlacementController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\RecruiterSearchController;
use App\Http\Controllers\Api\Admin\RecruitmentAssignmentController;
use App\Http\Controllers\Api\Admin\ReferenceCheckController;
use App\Http\Controllers\Api\Admin\SolutionController as AdminSolutionController;
use App\Http\Controllers\Api\Admin\StrategicLeadershipPartnerController;
use App\Http\Controllers\Api\Admin\TagController as AdminTagController;
use App\Http\Controllers\Api\Admin\TalentRequestController as AdminTalentRequestController;
use App\Http\Controllers\Api\Admin\TeamMemberController as AdminTeamMemberController;
use App\Http\Controllers\Api\Admin\TrustIndicatorController as AdminTrustIndicatorController;
use App\Http\Controllers\Api\Admin\VacancyController;
use App\Http\Controllers\Api\Admin\VerificationCaseController;
use App\Http\Controllers\Api\ArticleCategoryController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\ConsultationBookingController;
use App\Http\Controllers\Api\ContactSubmissionController;
use App\Http\Controllers\Api\CourseCategoryController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\ExpertPool\AssessmentController as ExpertAssessmentController;
use App\Http\Controllers\Api\ExpertPool\AssignmentFeedbackController as ExpertAssignmentFeedbackController;
use App\Http\Controllers\Api\ExpertPool\AuthController;
use App\Http\Controllers\Api\ExpertPool\ConsentController;
use App\Http\Controllers\Api\ExpertPool\CvController;
use App\Http\Controllers\Api\ExpertPool\EducationController;
use App\Http\Controllers\Api\ExpertPool\EmailVerificationController;
use App\Http\Controllers\Api\ExpertPool\ExperienceController;
use App\Http\Controllers\Api\ExpertPool\InterviewController as ExpertInterviewController;
use App\Http\Controllers\Api\ExpertPool\MfaController;
use App\Http\Controllers\Api\ExpertPool\OpportunityController;
use App\Http\Controllers\Api\ExpertPool\PasswordResetController;
use App\Http\Controllers\Api\ExpertPool\PlacementController as ExpertPlacementController;
use App\Http\Controllers\Api\ExpertPool\ProfileController;
use App\Http\Controllers\Api\JobApplicationController;
use App\Http\Controllers\Api\NewsletterSubscriberController;
use App\Http\Controllers\Api\Organisation\AssignmentFeedbackController as OrganisationAssignmentFeedbackController;
use App\Http\Controllers\Api\Organisation\AuthController as OrganisationAuthController;
use App\Http\Controllers\Api\Organisation\CandidateEvaluationController;
use App\Http\Controllers\Api\Organisation\EmailVerificationController as OrganisationEmailVerificationController;
use App\Http\Controllers\Api\Organisation\InterviewController as OrganisationInterviewController;
use App\Http\Controllers\Api\Organisation\MfaController as OrganisationMfaController;
use App\Http\Controllers\Api\Organisation\PasswordResetController as OrganisationPasswordResetController;
use App\Http\Controllers\Api\Organisation\PlacementController as OrganisationPlacementController;
use App\Http\Controllers\Api\Organisation\ProfileController as OrganisationProfileController;
use App\Http\Controllers\Api\Organisation\ReleasedCandidateController;
use App\Http\Controllers\Api\Organisation\TalentRequestController as OrganisationTalentRequestController;
use App\Http\Controllers\Api\Organisation\UserController as OrganisationUserController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SolutionController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\TeamMemberController;
use App\Http\Controllers\Api\TrustIndicatorController;
use App\Http\Middleware\EnsureIsAdmin;
use App\Http\Middleware\EnsureIsExpertUser;
use App\Http\Middleware\EnsureIsOrganisationUser;
use App\Http\Middleware\EnsureIsRsStaff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| Public, read-only content routes (Backend Phase 2)
|--------------------------------------------------------------------------
|
| No auth middleware — these back public pages on the Next.js frontend.
| Admin CRUD for the same tables lands in Phase 3 under a separate
| Sanctum-protected /api/admin/* route group, not added here.
*/
Route::apiResource('solutions', SolutionController::class)->only(['index', 'show']);
Route::apiResource('products', ProductController::class)->only(['index', 'show']);

Route::apiResource('articles', ArticleController::class)->only(['index', 'show']);
Route::apiResource('article-categories', ArticleCategoryController::class)->only(['index']);
Route::apiResource('tags', TagController::class)->only(['index']);

Route::apiResource('courses', CourseController::class)->only(['index', 'show']);
Route::apiResource('course-categories', CourseCategoryController::class)->only(['index']);

Route::apiResource('trust-indicators', TrustIndicatorController::class)->only(['index']);

Route::apiResource('team-members', TeamMemberController::class)->only(['index']);

/*
|--------------------------------------------------------------------------
| Expert Pool — Public / Auth routes
|--------------------------------------------------------------------------
|
| Rate-limited with the 'expert-auth' limiter (6 req/min per IP) defined
| in AppServiceProvider. No Sanctum guard required on these routes.
*/
Route::prefix('expert-pool')->name('expert-pool.')->middleware('throttle:expert-auth')->group(function () {
    // Registration
    Route::post('register', [AuthController::class, 'register'])->name('register');

    // Login
    Route::post('login', [AuthController::class, 'login'])->name('login');

    // Email verification
    Route::post('email/resend', [AuthController::class, 'resendVerification'])->name('verification.resend');
    Route::get(
        'email/verify/{id}/{hash}',
        [EmailVerificationController::class, 'verify']
    )->middleware('signed')->name('verification.verify');

    // Password reset
    Route::post('forgot-password', [PasswordResetController::class, 'forgotPassword'])->name('password.email');
    Route::post('reset-password', [PasswordResetController::class, 'resetPassword'])->name('password.reset');
});

/*
|--------------------------------------------------------------------------
| Expert Pool — MFA challenge (requires mfa-pending token)
|--------------------------------------------------------------------------
|
| Authenticated with Sanctum + expert-user type check.
| Separate throttle for MFA attempts (10 req/min).
*/
Route::prefix('expert-pool/mfa')->name('expert-pool.mfa.')->middleware(['auth:sanctum', EnsureIsExpertUser::class, 'throttle:expert-mfa'])->group(function () {
    Route::post('verify', [MfaController::class, 'verify'])->name('verify');
});

/*
|--------------------------------------------------------------------------
| Expert Pool — Authenticated expert routes
|--------------------------------------------------------------------------
|
| All routes below require a valid full Sanctum token belonging to an
| ExpertUser. The EnsureIsExpertUser middleware enforces this.
|
| `abilities:*` rejects a restricted mfa-pending token (see
| AuthController::login) — only a full session token can reach these.
| Mirrors the same guard already used on the admin route group below.
*/
Route::prefix('expert-pool')->name('expert-pool.')->middleware(['auth:sanctum', EnsureIsExpertUser::class, 'abilities:*'])->group(function () {
    // Account
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('me', [AuthController::class, 'me'])->name('me');

    // Profile
    Route::get('profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('profile/submit', [ProfileController::class, 'submit'])->name('profile.submit');
    Route::post('profile/change-password', [ProfileController::class, 'changePassword'])->name('profile.change-password');

    // Disciplines (read-only taxonomy list)
    Route::get('disciplines', [ProfileController::class, 'disciplines'])->name('disciplines.index');

    // Experience
    Route::get('experiences', [ExperienceController::class, 'index'])->name('experiences.index');
    Route::post('experiences', [ExperienceController::class, 'store'])->name('experiences.store');
    Route::patch('experiences/{id}', [ExperienceController::class, 'update'])->name('experiences.update');
    Route::delete('experiences/{id}', [ExperienceController::class, 'destroy'])->name('experiences.destroy');

    // Education
    Route::get('education', [EducationController::class, 'index'])->name('education.index');
    Route::post('education', [EducationController::class, 'store'])->name('education.store');
    Route::patch('education/{id}', [EducationController::class, 'update'])->name('education.update');
    Route::delete('education/{id}', [EducationController::class, 'destroy'])->name('education.destroy');

    // CV
    Route::post('cv', [CvController::class, 'upload'])->name('cv.upload');
    Route::get('cv/download', [CvController::class, 'download'])->name('cv.download');
    Route::delete('cv', [CvController::class, 'destroy'])->name('cv.destroy');

    // Opportunities (Phase 2) — invitations sent to this expert, and response.
    Route::get('opportunities', [OpportunityController::class, 'index'])->name('opportunities.index');
    Route::get('opportunities/{id}', [OpportunityController::class, 'show'])->name('opportunities.show');
    Route::post('opportunities/{id}/respond', [OpportunityController::class, 'respond'])->name('opportunities.respond');

    // Candidate consent (Phase 2)
    Route::get('consents', [ConsentController::class, 'index'])->name('consents.index');
    Route::post('consents/{id}/respond', [ConsentController::class, 'respond'])->name('consents.respond');
    Route::post('consents/{id}/withdraw', [ConsentController::class, 'withdraw'])->name('consents.withdraw');

    // Assessments & interviews (Phase 3)
    Route::get('assessments', [ExpertAssessmentController::class, 'index'])->name('assessments.index');
    Route::get('assessments/{id}', [ExpertAssessmentController::class, 'show'])->name('assessments.show');
    Route::post('assessments/{id}/submit', [ExpertAssessmentController::class, 'submit'])->name('assessments.submit');
    Route::get('assessments/{id}/submissions/{submissionId}/file', [ExpertAssessmentController::class, 'downloadFile'])->name('assessments.download-file');
    Route::get('interviews', [ExpertInterviewController::class, 'index'])->name('interviews.index');
    Route::get('interviews/{id}', [ExpertInterviewController::class, 'show'])->name('interviews.show');
    Route::post('interviews/{id}/confirm', [ExpertInterviewController::class, 'confirm'])->name('interviews.confirm');

    // Placement & feedback (Phase 4)
    Route::get('placements', [ExpertPlacementController::class, 'index'])->name('placements.index');
    Route::get('placements/{id}', [ExpertPlacementController::class, 'show'])->name('placements.show');
    Route::post('placements/{id}/confirm', [ExpertPlacementController::class, 'confirm'])->name('placements.confirm');
    Route::get('placements/{id}/feedback', [ExpertAssignmentFeedbackController::class, 'index'])->name('placements.feedback.index');
    Route::post('placements/{id}/feedback', [ExpertAssignmentFeedbackController::class, 'store'])->name('placements.feedback.store');

    // MFA setup/management (full session token required — not mfa-pending)
    Route::middleware('throttle:expert-mfa')->group(function () {
        Route::get('mfa/setup', [MfaController::class, 'setup'])->name('mfa.setup');
        Route::post('mfa/confirm', [MfaController::class, 'confirm'])->name('mfa.confirm');
        Route::post('mfa/disable', [MfaController::class, 'disable'])->name('mfa.disable');
        Route::get('mfa/recovery-codes', [MfaController::class, 'recoveryCodes'])->name('mfa.recovery-codes');
        Route::post('mfa/recovery-codes/regenerate', [MfaController::class, 'regenerateRecoveryCodes'])->name('mfa.recovery-codes.regenerate');
    });
});

/*
|--------------------------------------------------------------------------
| Public Submission Routes (Task 010)
|--------------------------------------------------------------------------
|
| Rate-limited to prevent form spamming.
*/
Route::middleware('throttle:6,1')->group(function () {
    Route::post('contact-submissions', [ContactSubmissionController::class, 'store'])->name('contact-submissions.store');
    Route::post('consultation-bookings', [ConsultationBookingController::class, 'store'])->name('consultation-bookings.store');
    Route::post('job-applications', [JobApplicationController::class, 'store'])->name('job-applications.store');
});

Route::post('newsletter-subscribers', [NewsletterSubscriberController::class, 'store'])->middleware('throttle:10,1')->name('newsletter-subscribers.store');

/*
|--------------------------------------------------------------------------
| Admin — Submissions & Job Applications Queue (Task 010)
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->name('admin.')->middleware(['auth:sanctum', EnsureIsAdmin::class])->group(function () {
    Route::get('contact-submissions', [AdminSubmissionsController::class, 'contactSubmissions'])->name('contact-submissions.index');
    Route::patch('contact-submissions/{id}', [AdminSubmissionsController::class, 'updateContactSubmission'])->name('contact-submissions.update');

    Route::get('consultation-bookings', [AdminSubmissionsController::class, 'consultationBookings'])->name('consultation-bookings.index');
    Route::patch('consultation-bookings/{id}', [AdminSubmissionsController::class, 'updateConsultationBooking'])->name('consultation-bookings.update');

    Route::get('newsletter-subscribers', [AdminSubmissionsController::class, 'newsletterSubscribers'])->name('newsletter-subscribers.index');

    Route::get('job-applications', [AdminSubmissionsController::class, 'jobApplications'])->name('job-applications.index');
    Route::patch('job-applications/{id}', [AdminSubmissionsController::class, 'updateJobApplication'])->name('job-applications.update');
    Route::get('job-applications/{id}/cv', [AdminSubmissionsController::class, 'downloadJobApplicationCv'])->name('job-applications.cv');
});

/*
|--------------------------------------------------------------------------
| Admin — Expert Pool
|--------------------------------------------------------------------------
|
| Requires a valid Sanctum token belonging to a User with role = 'admin'.
| No expert tokens are accepted here.
*/
Route::prefix('admin/expert-pool')->name('admin.expert-pool.')->middleware(['auth:sanctum', EnsureIsAdmin::class])->group(function () {
    Route::get('/', [AdminExpertPoolController::class, 'index'])->name('index');
    Route::get('/{id}', [AdminExpertPoolController::class, 'show'])->name('show');
    Route::patch('/{id}/status', [AdminExpertPoolController::class, 'updateStatus'])->name('update-status');
    Route::patch('/{id}/active', [AdminExpertPoolController::class, 'toggleActive'])->name('toggle-active');
    Route::get('/{id}/cv', [AdminExpertPoolController::class, 'downloadCv'])->name('cv');
});

/*
|--------------------------------------------------------------------------
| Admin — Auth (Task 014)
|--------------------------------------------------------------------------
|
| No self-registration — admin accounts are provisioned via
| `php artisan admin:create` only. MFA is mandatory for every admin.
*/
Route::prefix('admin')->name('admin.')->middleware('throttle:admin-auth')->group(function () {
    Route::post('login', [AdminAuthController::class, 'login'])->name('login');
});

Route::prefix('admin/mfa')->name('admin.mfa.')->middleware(['auth:sanctum', EnsureIsAdmin::class, 'throttle:admin-mfa'])->group(function () {
    Route::post('verify', [AdminAuthController::class, 'mfaVerify'])->name('verify');
});

/*
|--------------------------------------------------------------------------
| Admin — Authenticated routes (Task 014)
|--------------------------------------------------------------------------
|
| `abilities:*` rejects a restricted mfa-pending token (see
| AdminAuthController::login) — only a full session token can reach these.
*/
Route::prefix('admin')->name('admin.')->middleware(['auth:sanctum', EnsureIsAdmin::class, 'abilities:*'])->group(function () {
    Route::post('logout', [AdminAuthController::class, 'logout'])->name('logout');
    Route::get('me', [AdminAuthController::class, 'me'])->name('me');
    Route::post('change-password', [AdminAuthController::class, 'changePassword'])->name('change-password');

    Route::middleware('throttle:admin-mfa')->group(function () {
        Route::get('mfa/setup', [AdminAuthController::class, 'mfaSetup'])->name('mfa.setup');
        Route::post('mfa/confirm', [AdminAuthController::class, 'mfaConfirm'])->name('mfa.confirm');
        Route::post('mfa/disable', [AdminAuthController::class, 'mfaDisable'])->name('mfa.disable');
        Route::get('mfa/recovery-codes', [AdminAuthController::class, 'recoveryCodes'])->name('mfa.recovery-codes');
        Route::post('mfa/recovery-codes/regenerate', [AdminAuthController::class, 'regenerateRecoveryCodes'])->name('mfa.recovery-codes.regenerate');
    });

    // CMS — Tier 1
    Route::apiResource('solutions', AdminSolutionController::class)->except(['create', 'edit']);
    Route::apiResource('products', AdminProductController::class)->except(['create', 'edit']);
    Route::apiResource('article-categories', AdminArticleCategoryController::class)->except(['create', 'edit', 'show']);
    Route::apiResource('tags', AdminTagController::class)->except(['create', 'edit', 'show']);
    Route::apiResource('articles', AdminArticleController::class)->except(['create', 'edit']);
    Route::apiResource('course-categories', AdminCourseCategoryController::class)->except(['create', 'edit', 'show']);
    Route::apiResource('courses', AdminCourseController::class)->except(['create', 'edit']);
    Route::apiResource('trust-indicators', AdminTrustIndicatorController::class)->except(['create', 'edit', 'show']);
    Route::apiResource('team-members', AdminTeamMemberController::class)->except(['create', 'edit', 'show']);

    // CMS — Tier 2 (previously no controller at all)
    Route::apiResource('strategic-leadership-partners', StrategicLeadershipPartnerController::class)->except(['create', 'edit', 'show']);
    Route::apiResource('offices', OfficeController::class)->except(['create', 'edit', 'show']);
    Route::apiResource('vacancies', VacancyController::class)->except(['create', 'edit', 'show']);

    // Media Library — 'media' singularizes to 'medium' by default (irregular
    // plural), so the parameter name is forced explicitly to match the
    // controller's $media argument.
    Route::apiResource('media', MediaController::class)
        ->parameters(['media' => 'media'])
        ->only(['index', 'store', 'destroy']);

    // Audit Log
    Route::get('audit-log', [AuditLogController::class, 'index'])->name('audit-log.index');
});

/*
|--------------------------------------------------------------------------
| Organisation — Public / Auth routes (Phase 1)
|--------------------------------------------------------------------------
|
| Mirrors the Expert Pool auth route shape exactly. Self-registration with
| a verification gate (approved Phase 1 scope) — the organisation is
| created as PendingVerification and only ever moves to Verified via the
| RS-staff-only admin.organisations.update-status route below.
*/
Route::prefix('organisation')->name('organisation.')->middleware('throttle:organisation-auth')->group(function () {
    Route::post('register', [OrganisationAuthController::class, 'register'])->name('register');
    Route::post('login', [OrganisationAuthController::class, 'login'])->name('login');
    Route::post('forgot-password', [OrganisationPasswordResetController::class, 'forgotPassword'])->name('password.email');
    Route::post('reset-password', [OrganisationPasswordResetController::class, 'resetPassword'])->name('password.reset');
    Route::post('email/resend', [OrganisationAuthController::class, 'resendVerification'])->name('verification.resend');
    Route::get('email/verify/{id}/{hash}', [OrganisationEmailVerificationController::class, 'verify'])
        ->name('verification.verify');
});

/*
|--------------------------------------------------------------------------
| Organisation — MFA verify (isolated, ability-restricted token only)
|--------------------------------------------------------------------------
*/
Route::prefix('organisation/mfa')->name('organisation.mfa.')->middleware(['auth:sanctum', EnsureIsOrganisationUser::class, 'throttle:organisation-mfa'])->group(function () {
    Route::post('verify', [OrganisationMfaController::class, 'verify'])->name('verify');
});

/*
|--------------------------------------------------------------------------
| Organisation — Authenticated routes (Phase 1)
|--------------------------------------------------------------------------
|
| `abilities:*` applied from the first commit — the direct lesson from the
| Phase 0 Expert Pool MFA-bypass fix, not a retrofit.
*/
Route::prefix('organisation')->name('organisation.')->middleware(['auth:sanctum', EnsureIsOrganisationUser::class, 'abilities:*'])->group(function () {
    Route::post('logout', [OrganisationAuthController::class, 'logout'])->name('logout');
    Route::get('me', [OrganisationAuthController::class, 'me'])->name('me');
    Route::post('change-password', [OrganisationAuthController::class, 'changePassword'])->name('change-password');

    Route::middleware('throttle:organisation-mfa')->group(function () {
        Route::get('mfa/setup', [OrganisationMfaController::class, 'setup'])->name('mfa.setup');
        Route::post('mfa/confirm', [OrganisationMfaController::class, 'confirm'])->name('mfa.confirm');
        Route::post('mfa/disable', [OrganisationMfaController::class, 'disable'])->name('mfa.disable');
        Route::get('mfa/recovery-codes', [OrganisationMfaController::class, 'recoveryCodes'])->name('mfa.recovery-codes');
        Route::post('mfa/recovery-codes/regenerate', [OrganisationMfaController::class, 'regenerateRecoveryCodes'])->name('mfa.recovery-codes.regenerate');
    });

    Route::get('profile', [OrganisationProfileController::class, 'show'])->name('profile.show');
    Route::patch('profile', [OrganisationProfileController::class, 'update'])->name('profile.update');

    Route::get('users', [OrganisationUserController::class, 'index'])->name('users.index');
    Route::post('users', [OrganisationUserController::class, 'store'])->name('users.store');
    Route::delete('users/{id}', [OrganisationUserController::class, 'destroy'])->name('users.destroy');

    Route::get('talent-requests', [OrganisationTalentRequestController::class, 'index'])->name('talent-requests.index');
    Route::post('talent-requests', [OrganisationTalentRequestController::class, 'store'])->name('talent-requests.store');
    Route::get('talent-requests/{id}', [OrganisationTalentRequestController::class, 'show'])->name('talent-requests.show');

    // Released candidates (Phase 2) — Section 19 "ORGANISATION REVIEW WORKSPACE".
    Route::get('released-candidates', [ReleasedCandidateController::class, 'index'])->name('released-candidates.index');
    Route::get('released-candidates/{id}', [ReleasedCandidateController::class, 'show'])->name('released-candidates.show');
    Route::patch('released-candidates/{id}/status', [ReleasedCandidateController::class, 'updateStatus'])->name('released-candidates.update-status');
    Route::post('released-candidates/{id}/comments', [ReleasedCandidateController::class, 'addComment'])->name('released-candidates.comments.store');

    // Organisation evaluation (Phase 3) — structured scoring on a released candidate.
    Route::get('released-candidates/{releaseId}/evaluations', [CandidateEvaluationController::class, 'index'])->name('released-candidates.evaluations.index');
    Route::post('released-candidates/{releaseId}/evaluations', [CandidateEvaluationController::class, 'store'])->name('released-candidates.evaluations.store');
    Route::patch('released-candidates/{releaseId}/evaluations/{evaluationId}', [CandidateEvaluationController::class, 'update'])->name('released-candidates.evaluations.update');

    // Interviews (Phase 3) — visible only once the candidate has actually been released to this organisation.
    Route::get('interviews', [OrganisationInterviewController::class, 'index'])->name('interviews.index');
    Route::get('interviews/{id}', [OrganisationInterviewController::class, 'show'])->name('interviews.show');
    Route::post('interviews/{id}/scorecard', [OrganisationInterviewController::class, 'submitScorecard'])->name('interviews.scorecard.store');

    // Placement & feedback (Phase 4)
    Route::get('placements', [OrganisationPlacementController::class, 'index'])->name('placements.index');
    Route::get('placements/{id}', [OrganisationPlacementController::class, 'show'])->name('placements.show');
    Route::post('placements/{id}/confirm', [OrganisationPlacementController::class, 'confirm'])->name('placements.confirm');
    Route::get('placements/{id}/feedback', [OrganisationAssignmentFeedbackController::class, 'index'])->name('placements.feedback.index');
    Route::post('placements/{id}/feedback', [OrganisationAssignmentFeedbackController::class, 'store'])->name('placements.feedback.store');
});

/*
|--------------------------------------------------------------------------
| RS Staff — Talent Network foundation (Phase 1)
|--------------------------------------------------------------------------
|
| EnsureIsRsStaff passes any authenticated User regardless of RsRole
| (Recruiter, Verifier, Recruitment Manager, Super Admin) — narrower than
| EnsureIsAdmin (Super-Admin-only), which continues to gate the Task 014
| CMS/Media/Audit Log surface above, unchanged. Every action here is
| additionally checked by a Policy or Permission::hasPermission() for the
| specific role required — see OrganisationPolicy, TalentRequestPolicy,
| VerificationCasePolicy, and RecruiterSearchController.
*/
Route::prefix('admin/organisations')->name('admin.organisations.')->middleware(['auth:sanctum', EnsureIsRsStaff::class, 'abilities:*'])->group(function () {
    Route::get('/', [AdminOrganisationController::class, 'index'])->name('index');
    Route::get('/{id}', [AdminOrganisationController::class, 'show'])->name('show');
    Route::patch('/{id}/status', [AdminOrganisationController::class, 'updateStatus'])->name('update-status');
});

Route::prefix('admin/organisation-users')->name('admin.organisation-users.')->middleware(['auth:sanctum', EnsureIsRsStaff::class, 'abilities:*'])->group(function () {
    Route::get('/', [AdminOrganisationUserController::class, 'index'])->name('index');
    Route::patch('/{id}/active', [AdminOrganisationUserController::class, 'toggleActive'])->name('toggle-active');
});

Route::prefix('admin/talent-requests')->name('admin.talent-requests.')->middleware(['auth:sanctum', EnsureIsRsStaff::class, 'abilities:*'])->group(function () {
    Route::get('/', [AdminTalentRequestController::class, 'index'])->name('index');
    Route::get('/{id}', [AdminTalentRequestController::class, 'show'])->name('show');
    Route::patch('/{id}/status', [AdminTalentRequestController::class, 'updateStatus'])->name('update-status');
    Route::patch('/{id}/assign-recruiter', [AdminTalentRequestController::class, 'assignRecruiter'])->name('assign-recruiter');
});

Route::prefix('admin/recruiter-search')->name('admin.recruiter-search.')->middleware(['auth:sanctum', EnsureIsRsStaff::class, 'abilities:*'])->group(function () {
    Route::get('/', [RecruiterSearchController::class, 'index'])->name('index');
});

Route::prefix('admin/verification-cases')->name('admin.verification-cases.')->middleware(['auth:sanctum', EnsureIsRsStaff::class, 'abilities:*'])->group(function () {
    Route::get('/', [VerificationCaseController::class, 'index'])->name('index');
    Route::post('/', [VerificationCaseController::class, 'store'])->name('store');
    Route::get('/{id}', [VerificationCaseController::class, 'show'])->name('show');
    Route::post('/{caseId}/checks', [VerificationCaseController::class, 'storeCheck'])->name('checks.store');
    Route::patch('/{caseId}/checks/{checkId}', [VerificationCaseController::class, 'updateCheck'])->name('checks.update');
});

/*
|--------------------------------------------------------------------------
| RS Staff — Managed Recruitment Pipeline (Phase 2)
|--------------------------------------------------------------------------
*/
Route::prefix('admin/recruitment-assignments')->name('admin.recruitment-assignments.')->middleware(['auth:sanctum', EnsureIsRsStaff::class, 'abilities:*'])->group(function () {
    Route::get('/', [RecruitmentAssignmentController::class, 'index'])->name('index');
    Route::post('/', [RecruitmentAssignmentController::class, 'store'])->name('store');
    Route::get('/{id}', [RecruitmentAssignmentController::class, 'show'])->name('show');
    Route::patch('/{id}/reassign', [RecruitmentAssignmentController::class, 'reassign'])->name('reassign');
    Route::patch('/{id}/status', [RecruitmentAssignmentController::class, 'updateStatus'])->name('update-status');

    // Candidate pipeline — nested under its owning assignment.
    Route::get('/{assignmentId}/pipeline', [CandidatePipelineController::class, 'index'])->name('pipeline.index');
    Route::post('/{assignmentId}/pipeline', [CandidatePipelineController::class, 'store'])->name('pipeline.store');
    Route::post('/{assignmentId}/pipeline/{entryId}/screen', [CandidatePipelineController::class, 'screen'])->name('pipeline.screen');
    Route::post('/{assignmentId}/pipeline/{entryId}/quality-review', [CandidatePipelineController::class, 'qualityReview'])->name('pipeline.quality-review');
    Route::post('/{assignmentId}/pipeline/{entryId}/request-consent', [CandidatePipelineController::class, 'requestConsent'])->name('pipeline.request-consent');
    Route::post('/{assignmentId}/pipeline/{entryId}/invite', [OpportunityInvitationController::class, 'store'])->name('pipeline.invite');

    /*
    |----------------------------------------------------------------
    | Phase 3 — Assessment, Interview & Reference Check, nested under
    | the same owning pipeline entry as the Phase 2 actions above.
    |----------------------------------------------------------------
    */
    Route::get('/{assignmentId}/pipeline/{entryId}/assessments', [AdminAssessmentController::class, 'index'])->name('pipeline.assessments.index');
    Route::post('/{assignmentId}/pipeline/{entryId}/assessments', [AdminAssessmentController::class, 'store'])->name('pipeline.assessments.store');
    Route::get('/{assignmentId}/pipeline/{entryId}/assessments/{assessmentId}', [AdminAssessmentController::class, 'show'])->name('pipeline.assessments.show');
    Route::post('/{assignmentId}/pipeline/{entryId}/assessments/{assessmentId}/submissions/{submissionId}/score', [AdminAssessmentController::class, 'score'])->name('pipeline.assessments.score');
    Route::get('/{assignmentId}/pipeline/{entryId}/assessments/{assessmentId}/submissions/{submissionId}/file', [AdminAssessmentController::class, 'downloadFile'])->name('pipeline.assessments.download-file');

    Route::get('/{assignmentId}/pipeline/{entryId}/interviews', [AdminInterviewController::class, 'index'])->name('pipeline.interviews.index');
    Route::post('/{assignmentId}/pipeline/{entryId}/interviews', [AdminInterviewController::class, 'store'])->name('pipeline.interviews.store');
    Route::get('/{assignmentId}/pipeline/{entryId}/interviews/{interviewId}', [AdminInterviewController::class, 'show'])->name('pipeline.interviews.show');
    Route::patch('/{assignmentId}/pipeline/{entryId}/interviews/{interviewId}/status', [AdminInterviewController::class, 'updateStatus'])->name('pipeline.interviews.update-status');
    Route::post('/{assignmentId}/pipeline/{entryId}/interviews/{interviewId}/panel-members', [AdminInterviewController::class, 'addPanelMember'])->name('pipeline.interviews.panel-members.store');
    Route::post('/{assignmentId}/pipeline/{entryId}/interviews/{interviewId}/scorecard', [AdminInterviewController::class, 'submitScorecard'])->name('pipeline.interviews.scorecard.store');

    Route::get('/{assignmentId}/pipeline/{entryId}/reference-checks', [ReferenceCheckController::class, 'index'])->name('pipeline.reference-checks.index');
    Route::post('/{assignmentId}/pipeline/{entryId}/reference-checks', [ReferenceCheckController::class, 'store'])->name('pipeline.reference-checks.store');
    Route::patch('/{assignmentId}/pipeline/{entryId}/reference-checks/{referenceCheckId}', [ReferenceCheckController::class, 'update'])->name('pipeline.reference-checks.update');

    /*
    |----------------------------------------------------------------
    | Phase 4 — Placement & Assignment Feedback, nested under the
    | same owning pipeline entry as the Phase 2/3 actions above.
    |----------------------------------------------------------------
    */
    Route::get('/{assignmentId}/pipeline/{entryId}/placement', [AdminPlacementController::class, 'show'])->name('pipeline.placement.show');
    Route::post('/{assignmentId}/pipeline/{entryId}/placement', [AdminPlacementController::class, 'store'])->name('pipeline.placement.store');
    Route::patch('/{assignmentId}/pipeline/{entryId}/placement/cancel', [AdminPlacementController::class, 'cancel'])->name('pipeline.placement.cancel');
    Route::get('/{assignmentId}/pipeline/{entryId}/feedback', [AdminAssignmentFeedbackController::class, 'index'])->name('pipeline.feedback.index');
});

Route::prefix('admin/candidate-consents')->name('admin.candidate-consents.')->middleware(['auth:sanctum', EnsureIsRsStaff::class, 'abilities:*'])->group(function () {
    Route::post('/{consentId}/release', [CandidateReleaseController::class, 'store'])->name('release');
});
