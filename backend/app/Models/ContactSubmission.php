<?php

namespace App\Models;

use App\Enums\ContactSubmissionStatus;
use App\Enums\ContactSubmissionType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContactSubmission extends Model
{
    protected $fillable = [
        'type',
        'full_name',
        'email',
        'phone',
        'organization',
        'message',
        'related_product_id',
        'status',
        'internal_notes',
    ];

    protected function casts(): array
    {
        return [
            'type' => ContactSubmissionType::class,
            'status' => ContactSubmissionStatus::class,
        ];
    }

    public function relatedProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'related_product_id');
    }
}
