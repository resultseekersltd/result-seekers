<?php

namespace App\Http\Middleware;

use App\Models\ExpertUser;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Placed on Expert Pool authenticated routes after `auth:sanctum`.
 * Sanctum's polymorphic token table is shared with the admin `User` model —
 * this middleware ensures only ExpertUser tokens pass through, so an admin
 * bearer token cannot accidentally access expert-only endpoints.
 */
class EnsureIsExpertUser
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! ($request->user() instanceof ExpertUser)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return $next($request);
    }
}
