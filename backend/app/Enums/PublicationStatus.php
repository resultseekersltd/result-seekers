<?php

namespace App\Enums;

/**
 * Generic draft/published workflow shared by content admins CRUD directly
 * (articles, courses) — as opposed to review pipelines for public
 * submissions, which have their own dedicated status enums.
 */
enum PublicationStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
}
