<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseCategoryResource;
use App\Models\CourseCategory;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CourseCategoryController extends Controller
{
    /** GET /api/course-categories — Academy training categories, for filter UI. */
    public function index(): AnonymousResourceCollection
    {
        return CourseCategoryResource::collection(
            CourseCategory::query()->orderBy('order')->get(),
        );
    }
}
