<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HasPaginatedResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SolutionRequest;
use App\Http\Resources\SolutionResource;
use App\Models\Solution;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;

class SolutionController extends Controller
{
    use HasPaginatedResponse;

    public function index(): JsonResponse
    {
        return $this->paginatedResponse(Solution::query()->orderBy('order')->paginate(25), SolutionResource::class);
    }

    public function show(Solution $solution): JsonResponse
    {
        return response()->json(['data' => new SolutionResource($solution)]);
    }

    public function store(SolutionRequest $request): JsonResponse
    {
        $solution = Solution::create($request->validated());
        AuditLogger::log('solution.created', $solution, $request->validated());

        return response()->json(['data' => new SolutionResource($solution)], 201);
    }

    public function update(SolutionRequest $request, Solution $solution): JsonResponse
    {
        $solution->update($request->validated());
        AuditLogger::log('solution.updated', $solution, $request->validated());

        return response()->json(['data' => new SolutionResource($solution)]);
    }

    public function destroy(Solution $solution): JsonResponse
    {
        AuditLogger::log('solution.deleted', $solution);
        $solution->delete();

        return response()->json(['message' => 'Solution deleted.']);
    }
}
