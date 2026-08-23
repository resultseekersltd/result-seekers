<?php

namespace App\Http\Middleware;

use App\Models\OrganisationUser;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Exact mirror of EnsureIsExpertUser / EnsureIsAdmin — the third
 * principal-type check. Sanctum's shared personal_access_tokens table
 * means an admin or expert bearer token could otherwise authenticate
 * successfully against Organisation routes; this ensures only a real
 * OrganisationUser token passes.
 */
class EnsureIsOrganisationUser
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! ($request->user() instanceof OrganisationUser)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return $next($request);
    }
}
