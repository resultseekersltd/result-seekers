<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'url' => $this->url(),
            'path' => $this->path,
            'originalName' => $this->original_name,
            'mimeType' => $this->mime_type,
            'size' => $this->size,
            'altText' => $this->alt_text,
            'uploadedBy' => $this->uploader?->name,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
