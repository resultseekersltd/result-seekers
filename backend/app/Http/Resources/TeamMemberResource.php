<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** Shared by the public GET /api/team-members endpoint and the admin CMS — no field here is sensitive. */
class TeamMemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'roleTitle' => $this->role_title,
            'bio' => $this->bio,
            'photoPath' => $this->photo_path,
            'order' => $this->order,
            'isActive' => $this->is_active,
        ];
    }
}
