<?php

namespace Database\Seeders;

use App\Models\ExpertDiscipline;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * `expert_disciplines` already existed (from the earlier, unauthenticated
 * Expert Network application flow) but was never seeded. The Expert Pool
 * task brief itself specified this exact category list for "Areas of
 * Expertise" — reused verbatim here rather than inventing a separate list,
 * per the brief's own instruction to reuse approved categories.
 */
class ExpertDisciplineSeeder extends Seeder
{
    public function run(): void
    {
        $names = [
            'Research',
            'Monitoring & Evaluation',
            'Data Analytics',
            'GIS / Geospatial Intelligence',
            'Digital Transformation',
            'Software / Technology',
            'Education & Capacity Development',
            'Humanitarian / Development Work',
            'Climate / Environment',
            'Project Management',
            'Policy / Governance',
            'Other',
        ];

        foreach ($names as $name) {
            ExpertDiscipline::query()->updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name],
            );
        }
    }
}
