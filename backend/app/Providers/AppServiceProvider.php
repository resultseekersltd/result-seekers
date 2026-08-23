<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Named rate limiters used by Expert Pool auth routes.
        // "expert-auth"  → 6 attempts per minute (login / register / password reset).
        // "expert-mfa"   → 10 attempts per minute (MFA verify / recovery codes).
        RateLimiter::for('expert-auth', function (Request $request) {
            return Limit::perMinute(6)->by($request->ip());
        });

        RateLimiter::for('expert-mfa', function (Request $request) {
            return Limit::perMinute(10)->by(optional($request->user())->id ?: $request->ip());
        });

        // Same shape as expert-auth/expert-mfa, kept separate so admin and
        // expert login attempts don't share a throttle bucket.
        RateLimiter::for('admin-auth', function (Request $request) {
            return Limit::perMinute(6)->by($request->ip());
        });

        RateLimiter::for('admin-mfa', function (Request $request) {
            return Limit::perMinute(10)->by(optional($request->user())->id ?: $request->ip());
        });

        // Same shape again for the Organisation portal (Phase 1).
        RateLimiter::for('organisation-auth', function (Request $request) {
            return Limit::perMinute(6)->by($request->ip());
        });

        RateLimiter::for('organisation-mfa', function (Request $request) {
            return Limit::perMinute(10)->by(optional($request->user())->id ?: $request->ip());
        });
    }
}
