<?php

namespace App\Enums;

/** Academy audience tracks from 03_Feature_Specification.md §8: Corporate / Professional / Youth Development. */
enum CourseTrack: string
{
    case Corporate = 'corporate';
    case Professional = 'professional';
    case Youth = 'youth';
}
