<?php

namespace App\Http\Controllers\Api;

use App\Enums\PublicationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\SolutionResource;
use App\Models\Solution;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SolutionController extends Controller
{
    /** GET /api/solutions — the six solution areas, for nav/listing use. */
    public function index(): AnonymousResourceCollection
    {
        $solutions = Solution::query()
            ->where('is_active', true)
            ->orderBy('order')
            ->get();

        return SolutionResource::collection($solutions);
    }

    /** GET /api/solutions/{solution} — resolved by slug (Solution::getRouteKeyName()). */
    public function show(Solution $solution): SolutionResource
    {
        abort_if(! $solution->is_active, 404);

        $solution->load([
            'products' => fn ($query) => $query->where('is_active', true)->orderBy('order'),
            'articles' => fn ($query) => $query->where('status', PublicationStatus::Published)->latest('published_at'),
        ]);

        return new SolutionResource($solution);
    }
}
