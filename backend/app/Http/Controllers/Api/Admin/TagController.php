<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HasPaginatedResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TagRequest;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;

class TagController extends Controller
{
    use HasPaginatedResponse;

    public function index(): JsonResponse
    {
        return $this->paginatedResponse(Tag::query()->orderBy('name')->paginate(50), TagResource::class);
    }

    public function store(TagRequest $request): JsonResponse
    {
        $tag = Tag::create($request->validated());
        AuditLogger::log('tag.created', $tag, $request->validated());

        return response()->json(['data' => new TagResource($tag)], 201);
    }

    public function update(TagRequest $request, Tag $tag): JsonResponse
    {
        $tag->update($request->validated());
        AuditLogger::log('tag.updated', $tag, $request->validated());

        return response()->json(['data' => new TagResource($tag)]);
    }

    public function destroy(Tag $tag): JsonResponse
    {
        // article_tag is a plain cascade-on-delete pivot — safe to delete unconditionally.
        AuditLogger::log('tag.deleted', $tag);
        $tag->delete();

        return response()->json(['message' => 'Tag deleted.']);
    }
}
