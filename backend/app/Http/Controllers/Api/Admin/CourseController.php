<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HasPaginatedResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CourseRequest;
use App\Http\Resources\Admin\AdminCourseResource;
use App\Models\Course;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;

class CourseController extends Controller
{
    use HasPaginatedResponse;

    public function index(): JsonResponse
    {
        $courses = Course::query()->with('category')->orderBy('order')->paginate(20);

        return $this->paginatedResponse($courses, AdminCourseResource::class);
    }

    public function show(Course $course): JsonResponse
    {
        $course->load('category');

        return response()->json(['data' => new AdminCourseResource($course)]);
    }

    public function store(CourseRequest $request): JsonResponse
    {
        $course = Course::create($request->validated());
        $course->load('category');
        AuditLogger::log('course.created', $course, $request->validated());

        return response()->json(['data' => new AdminCourseResource($course)], 201);
    }

    public function update(CourseRequest $request, Course $course): JsonResponse
    {
        $course->update($request->validated());
        $course->load('category');
        AuditLogger::log('course.updated', $course, $request->validated());

        return response()->json(['data' => new AdminCourseResource($course)]);
    }

    public function destroy(Course $course): JsonResponse
    {
        AuditLogger::log('course.deleted', $course);
        $course->delete();

        return response()->json(['message' => 'Course deleted.']);
    }
}
