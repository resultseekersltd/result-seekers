<?php

namespace App\Enums;

/**
 * A single `vacancies` table covers Current Vacancies, the Graduate
 * Programme, and the Internship Programme (04_Development_Tasks.md,
 * Careers section) — this field is what distinguishes them instead of
 * three separate tables/models.
 */
enum VacancyType: string
{
    case Vacancy = 'vacancy';
    case GraduateProgramme = 'graduate_programme';
    case Internship = 'internship';
}
