<?php

namespace App\Enums;

enum ContactSubmissionStatus: string
{
    case New = 'new';
    case InProgress = 'in_progress';
    case Responded = 'responded';
    case Closed = 'closed';
}
