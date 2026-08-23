<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HasPaginatedResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\OfficeRequest;
use App\Http\Resources\Admin\OfficeResource;
use App\Models\Office;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;

class OfficeController extends Controller
{
    use HasPaginatedResponse;

    public function index(): JsonResponse
    {
        return $this->paginatedResponse(Office::query()->orderBy('order')->paginate(25), OfficeResource::class);
    }

    public function store(OfficeRequest $request): JsonResponse
    {
        $office = Office::create($request->validated());
        AuditLogger::log('office.created', $office, $request->validated());

        return response()->json(['data' => new OfficeResource($office)], 201);
    }

    public function update(OfficeRequest $request, Office $office): JsonResponse
    {
        $office->update($request->validated());
        AuditLogger::log('office.updated', $office, $request->validated());

        return response()->json(['data' => new OfficeResource($office)]);
    }

    public function destroy(Office $office): JsonResponse
    {
        AuditLogger::log('office.deleted', $office);
        $office->delete();

        return response()->json(['message' => 'Office deleted.']);
    }
}
