<?php

namespace App\Enums;

enum ConsultationStatus: string
{
    case New = 'new';
    case Confirmed = 'confirmed';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
}
