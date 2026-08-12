<?php

namespace Database\Seeders;

use App\Models\CourseCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/** Academy training categories — 05_Content_and_Product_Specification.md §7. */
class CourseCategorySeeder extends Seeder
{
    public function run(): void
    {
        $names = [
            'Research Methods', 'Monitoring & Evaluation', 'KoboToolbox', 'Data Collection',
            'Data Analytics', 'Power BI', 'GIS & Mapping', 'Artificial Intelligence',
            'Python Programming', 'Web Development', 'Digital Transformation',
            'Information Management', 'Humanitarian Data', 'Proposal Development',
            'Leadership & Management',
        ];

        foreach ($names as $index => $name) {
            CourseCategory::query()->updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'order' => $index + 1],
            );
        }
    }
}
