<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HasPaginatedResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ArticleRequest;
use App\Http\Resources\Admin\AdminArticleResource;
use App\Models\Article;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;

class ArticleController extends Controller
{
    use HasPaginatedResponse;

    public function index(): JsonResponse
    {
        $articles = Article::query()->with('category')->latest('updated_at')->paginate(20);

        return $this->paginatedResponse($articles, AdminArticleResource::class);
    }

    public function show(Article $article): JsonResponse
    {
        $article->load(['category', 'tags', 'solutions']);

        return response()->json(['data' => new AdminArticleResource($article)]);
    }

    public function store(ArticleRequest $request): JsonResponse
    {
        $article = Article::create($request->safe()->except(['tag_ids', 'solution_ids']));
        $article->tags()->sync($request->input('tag_ids', []));
        $article->solutions()->sync($request->input('solution_ids', []));
        $article->load(['category', 'tags', 'solutions']);

        AuditLogger::log('article.created', $article, $request->validated());

        return response()->json(['data' => new AdminArticleResource($article)], 201);
    }

    public function update(ArticleRequest $request, Article $article): JsonResponse
    {
        $article->update($request->safe()->except(['tag_ids', 'solution_ids']));
        $article->tags()->sync($request->input('tag_ids', []));
        $article->solutions()->sync($request->input('solution_ids', []));
        $article->load(['category', 'tags', 'solutions']);

        AuditLogger::log('article.updated', $article, $request->validated());

        return response()->json(['data' => new AdminArticleResource($article)]);
    }

    public function destroy(Article $article): JsonResponse
    {
        AuditLogger::log('article.deleted', $article);
        $article->delete();

        return response()->json(['message' => 'Article deleted.']);
    }
}
