<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HasPaginatedResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UploadMediaRequest;
use App\Http\Resources\Admin\MediaResource;
use App\Models\Media;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    use HasPaginatedResponse;

    public function index(): JsonResponse
    {
        return $this->paginatedResponse(Media::query()->latest()->paginate(30), MediaResource::class);
    }

    /**
     * Upload a new media item to the public disk. The filename is never
     * trusted — a UUID is generated instead — and the original name is
     * kept separately for display.
     */
    public function store(UploadMediaRequest $request): JsonResponse
    {
        $file = $request->file('file');
        $path = $file->store('media', 'public');

        $media = Media::create([
            'disk' => 'public',
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'alt_text' => $request->input('alt_text'),
            'uploaded_by' => $request->user()->id,
        ]);

        AuditLogger::log('media.uploaded', $media);

        return response()->json(['data' => new MediaResource($media)], 201);
    }

    /**
     * Delete a media item. Note: this project's media library is
     * deliberately simple and does not track which content records
     * reference a given file's path (see Task 014 report), so deleting a
     * still-referenced image will leave that reference broken — the admin
     * is responsible for checking usage before deleting.
     */
    public function destroy(Media $media): JsonResponse
    {
        Storage::disk($media->disk)->delete($media->path);
        AuditLogger::log('media.deleted', $media);
        $media->delete();

        return response()->json(['message' => 'Media deleted.']);
    }
}
