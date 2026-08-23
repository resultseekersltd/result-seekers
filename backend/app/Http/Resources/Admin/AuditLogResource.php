<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'actorType' => $this->actor_type ? class_basename($this->actor_type) : null,
            'actorName' => $this->actor_name,
            'action' => $this->action,
            'subjectType' => $this->subject_type ? class_basename($this->subject_type) : null,
            'subjectId' => $this->subject_id,
            'subjectLabel' => $this->subject_label,
            'changes' => $this->changes,
            'ipAddress' => $this->ip_address,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
