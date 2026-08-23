<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ExpertVisibility;
use App\Enums\Permission;
use App\Http\Controllers\Concerns\HasPaginatedResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\ExpertSearchResult;
use App\Models\ExpertPoolProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * RS-Recruiter-only professional discovery — talent-expert.txt is explicit
 * that organisations "must not be able to... browse the entire candidate
 * database"; only the Result Seekers Recruiter role searches (readiness
 * report's discovery-model correction). Gated by the TalentSearch
 * permission, not a Policy (this is a collection/search action, not a
 * single-resource authorization decision). Only discoverable-visibility
 * profiles are ever returned (never Private/TemporarilyUnavailable/
 * Archived), and the response is the allowlist-shaped ExpertSearchResult,
 * never the full ExpertPoolProfile (talent-expert.txt §13).
 */
class RecruiterSearchController extends Controller
{
    use HasPaginatedResponse;

    public function index(Request $request): JsonResponse
    {
        $actor = $request->user();

        if (! $actor->hasPermission(Permission::TalentSearch)) {
            throw new AccessDeniedHttpException('You do not have permission to search the professional database.');
        }

        $discoverable = array_filter(
            ExpertVisibility::cases(),
            fn (ExpertVisibility $visibility) => $visibility->isDiscoverable(),
        );

        $query = ExpertPoolProfile::with('disciplines')
            ->whereIn('visibility_status', array_map(fn ($v) => $v->value, $discoverable));

        if ($discipline = $request->query('discipline')) {
            $query->whereHas('disciplines', fn ($q) => $q->where('slug', $discipline));
        }

        if ($country = $request->query('country')) {
            $query->where('country', $country);
        }

        if ($minExperience = $request->query('min_experience')) {
            $query->where('years_experience', '>=', (int) $minExperience);
        }

        if ($verificationLevel = $request->query('verification_level')) {
            $query->where('verification_level', $verificationLevel);
        }

        $results = $query->latest()->paginate(25);

        return $this->paginatedResponse($results, ExpertSearchResult::class);
    }
}
