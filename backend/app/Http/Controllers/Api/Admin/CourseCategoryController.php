<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HasPaginatedResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CourseCategoryRequest;
use App\Http\Resources\CourseCategoryResource;
use App\Models\CourseCategory;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;

class CourseCategoryController extends Controller
{
    use HasPaginatedResponse;

    public function index(): JsonResponse
    {
        return $this->paginatedResponse(CourseCategory::query()->orderBy('order')->paginate(50), CourseCategoryResource::class);
    }

    public function store(CourseCategoryRequest $request): JsonResponse
    {
        $category = CourseCategory::create($request->validated());
        AuditLogger::log('course_category.created', $category, $request->validated());

        return response()->json(['data' => new CourseCategoryResource($category)], 201);
    }

    // Parameter name must be snake_case to match the apiResource-generated
    // {course_category} route wildcard for implicit model binding.
    public function update(CourseCategoryRequest $request, CourseCategory $course_category): JsonResponse
    {
        $course_category->update($request->validated());
        AuditLogger::log('course_category.updated', $course_category, $request->validated());

        return response()->json(['data' => new CourseCategoryResource($course_category)]);
    }

    public function destroy(CourseCategory $course_category): JsonResponse
    {
        if ($course_category->courses()->exists()) {
            return response()->json([
                'message' => 'This category still has courses assigned to it. Reassign or delete them first.',
            ], 422);
        }

        AuditLogger::log('course_category.deleted', $course_category);
        $course_category->delete();

        return response()->json(['message' => 'Category deleted.']);
    }
}
