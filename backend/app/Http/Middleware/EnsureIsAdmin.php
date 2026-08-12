<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Placed on admin Expert Pool routes after `auth:sanctum`.
 * Only allows through requests from `User` accounts that carry the
 * `role = 'admin'` column added by the add_role_to_users_table migration.
 */
class EnsureIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! ($user instanceof User) || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return $next($request);
    }
}
