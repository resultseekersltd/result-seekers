<?php

namespace App\Enums;

enum VacancyStatus: string
{
    case Draft = 'draft';
    case Open = 'open';
    case Closed = 'closed';
}
