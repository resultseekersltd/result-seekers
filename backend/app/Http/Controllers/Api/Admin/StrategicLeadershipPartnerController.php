<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HasPaginatedResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StrategicLeadershipPartnerRequest;
use App\Http\Resources\Admin\StrategicLeadershipPartnerResource;
use App\Models\StrategicLeadershipPartner;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;

class StrategicLeadershipPartnerController extends Controller
{
    use HasPaginatedResponse;

    public function index(): JsonResponse
    {
        return $this->paginatedResponse(
            StrategicLeadershipPartner::query()->orderBy('order')->paginate(25),
            StrategicLeadershipPartnerResource::class,
        );
    }

    public function store(StrategicLeadershipPartnerRequest $request): JsonResponse
    {
        $partner = StrategicLeadershipPartner::create($request->validated());
        AuditLogger::log('strategic_leadership_partner.created', $partner, $request->validated());

        return response()->json(['data' => new StrategicLeadershipPartnerResource($partner)], 201);
    }

    // Parameter name must be snake_case to match the apiResource-generated
    // {strategic_leadership_partner} route wildcard for implicit model binding.
    public function update(StrategicLeadershipPartnerRequest $request, StrategicLeadershipPartner $strategic_leadership_partner): JsonResponse
    {
        $strategic_leadership_partner->update($request->validated());
        AuditLogger::log('strategic_leadership_partner.updated', $strategic_leadership_partner, $request->validated());

        return response()->json(['data' => new StrategicLeadershipPartnerResource($strategic_leadership_partner)]);
    }

    public function destroy(StrategicLeadershipPartner $strategic_leadership_partner): JsonResponse
    {
        AuditLogger::log('strategic_leadership_partner.deleted', $strategic_leadership_partner);
        $strategic_leadership_partner->delete();

        return response()->json(['message' => 'Partner deleted.']);
    }
}
