<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleCategoryResource;
use App\Models\ArticleCategory;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ArticleCategoryController extends Controller
{
    /** GET /api/article-categories — Knowledge Centre content types, for filter UI. */
    public function index(): AnonymousResourceCollection
    {
        return ArticleCategoryResource::collection(
            ArticleCategory::query()->orderBy('order')->get(),
        );
    }
}
