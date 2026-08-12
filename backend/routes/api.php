<?php

use App\Http\Controllers\Api\Admin\AdminSubmissionsController;
use App\Http\Controllers\Api\Admin\ExpertPoolController as AdminExpertPoolController;
use App\Http\Controllers\Api\ArticleCategoryController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\ConsultationBookingController;
use App\Http\Controllers\Api\ContactSubmissionController;
use App\Http\Controllers\Api\CourseCategoryController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\ExpertPool\AuthController;
use App\Http\Controllers\Api\ExpertPool\CvController;
use App\Http\Controllers\Api\ExpertPool\EducationController;
use App\Http\Controllers\Api\ExpertPool\EmailVerificationController;
use App\Http\Controllers\Api\ExpertPool\ExperienceController;
use App\Http\Controllers\Api\ExpertPool\MfaController;
use App\Http\Controllers\Api\ExpertPool\PasswordResetController;
use App\Http\Controllers\Api\ExpertPool\ProfileController;
use App\Http\Controllers\Api\JobApplicationController;
use App\Http\Controllers\Api\NewsletterSubscriberController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SolutionController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\TrustIndicatorController;
use App\Http\Middleware\EnsureIsAdmin;
use App\Http\Middleware\EnsureIsExpertUser;
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
*/
Route::prefix('expert-pool')->name('expert-pool.')->middleware(['auth:sanctum', EnsureIsExpertUser::class])->group(function () {
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
});
