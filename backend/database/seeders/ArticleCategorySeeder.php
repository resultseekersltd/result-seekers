<?php

namespace Database\Seeders;

use App\Models\ArticleCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/** Knowledge Centre content types — 05_Content_and_Product_Specification.md §8. */
class ArticleCategorySeeder extends Seeder
{
    public function run(): void
    {
        $names = [
            'Articles', 'Reports', 'Case Studies', 'Data Stories', 'Maps',
            'Dashboards', 'Guides', 'Templates', 'Situation Updates', 'Resources',
        ];

        foreach ($names as $index => $name) {
            ArticleCategory::query()->updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'order' => $index + 1],
            );
        }
    }
}
