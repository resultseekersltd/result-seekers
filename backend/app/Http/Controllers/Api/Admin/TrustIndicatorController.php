<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HasPaginatedResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TrustIndicatorRequest;
use App\Http\Resources\TrustIndicatorResource;
use App\Models\TrustIndicator;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;

class TrustIndicatorController extends Controller
{
    use HasPaginatedResponse;

    public function index(): JsonResponse
    {
        return $this->paginatedResponse(TrustIndicator::query()->orderBy('order')->paginate(50), TrustIndicatorResource::class);
    }

    public function store(TrustIndicatorRequest $request): JsonResponse
    {
        $indicator = TrustIndicator::create($request->validated());
        AuditLogger::log('trust_indicator.created', $indicator, $request->validated());

        return response()->json(['data' => new TrustIndicatorResource($indicator)], 201);
    }

    // Parameter name must be snake_case to match the apiResource-generated
    // {trust_indicator} route wildcard for implicit model binding.
    public function update(TrustIndicatorRequest $request, TrustIndicator $trust_indicator): JsonResponse
    {
        $trust_indicator->update($request->validated());
        AuditLogger::log('trust_indicator.updated', $trust_indicator, $request->validated());

        return response()->json(['data' => new TrustIndicatorResource($trust_indicator)]);
    }

    public function destroy(TrustIndicator $trust_indicator): JsonResponse
    {
        AuditLogger::log('trust_indicator.deleted', $trust_indicator);
        $trust_indicator->delete();

        return response()->json(['message' => 'Trust indicator deleted.']);
    }
}
