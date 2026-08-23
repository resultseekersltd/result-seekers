<?php

namespace App\Http\Middleware;

use App\Enums\RsRole;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Placed on admin Expert Pool routes after `auth:sanctum`.
 * Only allows through requests from `User` accounts holding the
 * `RsRole::SuperAdmin` role — behaviourally identical to the original
 * `$user->role !== 'admin'` string check (SuperAdmin's backing value is
 * still the literal 'admin' string; no existing account or data changed).
 * Deliberately still Super-Admin-only, not "any RS staff" — the newer,
 * broader Recruiter/Verifier/Recruitment Manager roles get the separate,
 * intentionally wider EnsureIsRsStaff middleware on their own new routes
 * instead of automatically inheriting the full existing CMS/Media/Audit
 * Log surface this middleware guards.
 */
class EnsureIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! ($user instanceof User) || $user->role !== RsRole::SuperAdmin) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return $next($request);
    }
}
