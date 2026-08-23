<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HasPaginatedResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ArticleCategoryRequest;
use App\Http\Resources\ArticleCategoryResource;
use App\Models\ArticleCategory;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;

class ArticleCategoryController extends Controller
{
    use HasPaginatedResponse;

    public function index(): JsonResponse
    {
        return $this->paginatedResponse(ArticleCategory::query()->orderBy('order')->paginate(50), ArticleCategoryResource::class);
    }

    public function store(ArticleCategoryRequest $request): JsonResponse
    {
        $category = ArticleCategory::create($request->validated());
        AuditLogger::log('article_category.created', $category, $request->validated());

        return response()->json(['data' => new ArticleCategoryResource($category)], 201);
    }

    // Parameter name must be snake_case to match the apiResource-generated
    // {article_category} route wildcard for implicit model binding.
    public function update(ArticleCategoryRequest $request, ArticleCategory $article_category): JsonResponse
    {
        $article_category->update($request->validated());
        AuditLogger::log('article_category.updated', $article_category, $request->validated());

        return response()->json(['data' => new ArticleCategoryResource($article_category)]);
    }

    public function destroy(ArticleCategory $article_category): JsonResponse
    {
        if ($article_category->articles()->exists()) {
            return response()->json([
                'message' => 'This category still has articles assigned to it. Reassign or delete them first.',
            ], 422);
        }

        AuditLogger::log('article_category.deleted', $article_category);
        $article_category->delete();

        return response()->json(['message' => 'Category deleted.']);
    }
}
