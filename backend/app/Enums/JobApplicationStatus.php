<?php

namespace App\Enums;

/** Review pipeline requested for Job Applications: new → shortlisted → interviewing → rejected/hired. */
enum JobApplicationStatus: string
{
    case New = 'new';
    case Shortlisted = 'shortlisted';
    case Interviewing = 'interviewing';
    case Rejected = 'rejected';
    case Hired = 'hired';
}
