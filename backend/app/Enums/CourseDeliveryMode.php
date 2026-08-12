<?php

namespace App\Enums;

enum CourseDeliveryMode: string
{
    case InPerson = 'in_person';
    case Online = 'online';
    case Hybrid = 'hybrid';
}
