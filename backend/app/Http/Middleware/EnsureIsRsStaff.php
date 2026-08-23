<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Broader sibling of EnsureIsAdmin: passes any authenticated `User`
 * (RS staff) regardless of which RsRole they hold — Recruiter, Verifier,
 * Recruitment Manager, or Super Admin. Placed on the new Phase 1 RS-side
 * routes (organisations, talent requests, recruiter search, verification)
 * that these roles need to reach; the pre-existing Task 014 CMS/Media/
 * Audit Log/Expert Pool admin routes stay behind EnsureIsAdmin
 * (Super Admin only), unchanged. Fine-grained "which of these four roles
 * may do this specific action" is enforced per-route by Policies/
 * HasPermissions, not by this middleware — this only confirms the caller
 * is RS staff at all, not an OrganisationUser or ExpertUser token.
 */
class EnsureIsRsStaff
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! ($request->user() instanceof User)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return $next($request);
    }
}
