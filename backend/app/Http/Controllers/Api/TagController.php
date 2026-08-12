<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TagController extends Controller
{
    /** GET /api/tags — for Knowledge Centre filter UI. */
    public function index(): AnonymousResourceCollection
    {
        return TagResource::collection(
            Tag::query()->orderBy('name')->get(),
        );
    }
}
