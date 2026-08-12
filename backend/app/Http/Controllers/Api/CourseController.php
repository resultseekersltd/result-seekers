<?php

namespace App\Http\Controllers\Api;

use App\Enums\PublicationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CourseController extends Controller
{
    /** GET /api/courses?category=&track=&per_page= — published Academy courses. */
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'category' => ['sometimes', 'string', 'max:255'],
            'track' => ['sometimes', 'string', 'max:255'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ]);

        $courses = Course::query()
            ->where('status', PublicationStatus::Published)
            ->with('category')
            ->when(
                $validated['category'] ?? null,
                fn ($query, $slug) => $query->whereHas('category', fn ($q) => $q->where('slug', $slug)),
            )
            ->when($validated['track'] ?? null, fn ($query, $track) => $query->where('track', $track))
            ->orderBy('order')
            ->paginate($validated['per_page'] ?? 12);

        return CourseResource::collection($courses);
    }

    /** GET /api/courses/{course} — resolved by slug (Course::getRouteKeyName()). */
    public function show(Course $course): CourseResource
    {
        abort_if($course->status !== PublicationStatus::Published, 404);

        $course->load('category');

        return new CourseResource($course);
    }
}
