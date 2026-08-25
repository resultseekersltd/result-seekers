<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HasPaginatedResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\VacancyRequest;
use App\Http\Resources\Admin\VacancyResource;
use App\Models\Vacancy;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;

class VacancyController extends Controller
{
    use HasPaginatedResponse;

    public function index(): JsonResponse
    {
        return $this->paginatedResponse(Vacancy::query()->orderBy('order')->paginate(25), VacancyResource::class);
    }

    public function store(VacancyRequest $request): JsonResponse
    {
        $vacancy = Vacancy::create($request->validated());
        AuditLogger::log('vacancy.created', $vacancy, $request->validated());

        return response()->json(['data' => new VacancyResource($vacancy)], 201);
    }

    public function update(VacancyRequest $request, Vacancy $vacancy): JsonResponse
    {
        $vacancy->update($request->validated());
        AuditLogger::log('vacancy.updated', $vacancy, $request->validated());

        return response()->json(['data' => new VacancyResource($vacancy)]);
    }

    public function destroy(Vacancy $vacancy): JsonResponse
    {
        AuditLogger::log('vacancy.deleted', $vacancy);
        $vacancy->delete();

        return response()->json(['message' => 'Vacancy deleted.']);
    }
}
