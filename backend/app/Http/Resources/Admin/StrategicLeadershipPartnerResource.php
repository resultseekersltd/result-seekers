<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StrategicLeadershipPartnerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'fullName' => $this->full_name,
            'headline' => $this->headline,
            'bio' => $this->bio,
            'photoPath' => $this->photo_path,
            'linkedinUrl' => $this->linkedin_url,
            'isPublished' => $this->is_published,
            'order' => $this->order,
        ];
    }
}
