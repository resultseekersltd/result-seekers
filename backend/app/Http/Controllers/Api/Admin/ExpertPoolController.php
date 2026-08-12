<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AdminExpertUserResource;
use App\Models\ExpertUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Admin-only Expert Pool management.
 * All routes under this controller require auth:sanctum + EnsureIsAdmin.
 * Data is always read directly from the live database — no stale copies.
 */
class ExpertPoolController extends Controller
{
    /**
     * Paginated list of all expert accounts with embedded profiles.
     * Supports filtering by status, country, and search (name/email).
     */
    public function index(Request $request): JsonResponse
    {
        $query = ExpertUser::with([
            'profile.disciplines',
            'profile.experiences',
            'profile.education',
        ]);

        // Search by name or email.
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by profile status.
        if ($status = $request->query('status')) {
            $query->whereHas('profile', fn ($q) => $q->where('status', $status));
        }

        // Filter by country.
        if ($country = $request->query('country')) {
            $query->whereHas('profile', fn ($q) => $q->where('country', $country));
        }

        // Filter by email verification.
        if ($request->query('verified') === 'true') {
            $query->whereNotNull('email_verified_at');
        } elseif ($request->query('verified') === 'false') {
            $query->whereNull('email_verified_at');
        }

        $experts = $query->latest()->paginate(25);

        return response()->json([
            'data' => AdminExpertUserResource::collection($experts),
            'meta' => [
                'current_page' => $experts->currentPage(),
                'last_page' => $experts->lastPage(),
                'per_page' => $experts->perPage(),
                'total' => $experts->total(),
            ],
        ]);
    }

    /**
     * Full detail for a single expert.
     */
    public function show(int $id): JsonResponse
    {
        $expert = ExpertUser::with([
            'profile.disciplines',
            'profile.experiences',
            'profile.education',
        ])->findOrFail($id);

        return response()->json(['data' => new AdminExpertUserResource($expert)]);
    }

    /**
     * Update profile workflow status (under_review, approved, rejected, suspended).
     * Admin-only transitions — experts cannot trigger these directly.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'string', 'in:under_review,approved,rejected,suspended'],
        ]);

        $expert = ExpertUser::with('profile')->findOrFail($id);
        $profile = $expert->profile;

        if (! $profile) {
            return response()->json(['message' => 'This expert has no profile yet.'], 422);
        }

        $profile->update([
            'status' => $request->status,
            'reviewed_at' => now(),
            'reviewed_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Profile status updated.',
            'data' => new AdminExpertUserResource($expert->fresh(['profile.disciplines', 'profile.experiences', 'profile.education'])),
        ]);
    }

    /**
     * Suspend or reactivate an expert account.
     */
    public function toggleActive(Request $request, int $id): JsonResponse
    {
        $request->validate(['is_active' => ['required', 'boolean']]);

        $expert = ExpertUser::findOrFail($id);
        $expert->forceFill(['is_active' => $request->boolean('is_active')])->save();

        return response()->json([
            'message' => $expert->is_active ? 'Account activated.' : 'Account suspended.',
            'is_active' => $expert->is_active,
        ]);
    }
}
