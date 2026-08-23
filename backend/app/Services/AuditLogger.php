<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;

/**
 * Shared audit-log writer, called explicitly from admin controllers
 * (matches this project's existing style — e.g.
 * Api\Admin\ExpertPoolController already hand-sets reviewed_by/reviewed_at
 * rather than relying on model-event magic) rather than a global model
 * observer, so every log entry has a deliberate, readable call site.
 */
class AuditLogger
{
    /**
     * @param  array<string, mixed>  $changes
     */
    public static function log(string $action, ?Model $subject = null, array $changes = [], ?Authenticatable $actor = null): AuditLog
    {
        $actor ??= request()->user();

        return AuditLog::create([
            'actor_type' => $actor ? $actor::class : null,
            'actor_id' => $actor?->getAuthIdentifier(),
            'actor_name' => $actor->name ?? null,
            'action' => $action,
            'subject_type' => $subject ? $subject::class : null,
            'subject_id' => $subject?->getKey(),
            'subject_label' => self::labelFor($subject),
            'changes' => $changes ?: null,
            'ip_address' => request()->ip(),
        ]);
    }

    private static function labelFor(?Model $subject): ?string
    {
        if (! $subject) {
            return null;
        }

        foreach (['name', 'title', 'email', 'slug'] as $field) {
            if (! empty($subject->{$field})) {
                return (string) $subject->{$field};
            }
        }

        return null;
    }
}
