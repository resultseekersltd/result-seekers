<?php

namespace App\Http\Controllers\Api;

use App\Enums\PublicationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ArticleController extends Controller
{
    /** GET /api/articles?category=&tag=&per_page= — published Knowledge Centre entries. */
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'category' => ['sometimes', 'string', 'max:255'],
            'tag' => ['sometimes', 'string', 'max:255'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ]);

        $articles = Article::query()
            ->where('status', PublicationStatus::Published)
            ->with('category')
            ->when(
                $validated['category'] ?? null,
                fn ($query, $slug) => $query->whereHas('category', fn ($q) => $q->where('slug', $slug)),
            )
            ->when(
                $validated['tag'] ?? null,
                fn ($query, $slug) => $query->whereHas('tags', fn ($q) => $q->where('slug', $slug)),
            )
            ->latest('published_at')
            ->paginate($validated['per_page'] ?? 12);

        return ArticleResource::collection($articles);
    }

    /** GET /api/articles/{article} — resolved by slug (Article::getRouteKeyName()). */
    public function show(Article $article): ArticleResource
    {
        abort_if($article->status !== PublicationStatus::Published, 404);

        $article->load(['category', 'tags', 'solutions']);

        return new ArticleResource($article);
    }
}
