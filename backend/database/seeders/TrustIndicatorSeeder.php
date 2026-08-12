<?php

namespace Database\Seeders;

use App\Models\TrustIndicator;
use Illuminate\Database\Seeder;

/**
 * The 8 approved trust indicators — 05_Content_and_Product_Specification.md
 * §3 / 01_Project_Vision_and_Architecture.md §7. This is the complete,
 * capped list; the docs explicitly say not to add more. Matched by
 * `label` so re-running this seeder updates rather than duplicates.
 */
class TrustIndicatorSeeder extends Seeder
{
    public function run(): void
    {
        $indicators = [
            ['type' => 'numeric', 'value' => 16, 'suffix' => '+', 'label' => 'Years of Experience', 'order' => 1],
            ['type' => 'numeric', 'value' => 50, 'suffix' => '+', 'label' => 'Projects & Assignments Delivered', 'order' => 2],
            ['type' => 'numeric', 'value' => 20, 'suffix' => '+', 'label' => 'Organizations Supported', 'order' => 3],
            ['type' => 'qualitative', 'value' => null, 'suffix' => null, 'label' => 'Offices in Abuja and Kano', 'order' => 4],
            ['type' => 'qualitative', 'value' => null, 'suffix' => null, 'label' => 'Nationwide team of staff, consultants, and interns', 'order' => 5],
            ['type' => 'qualitative', 'value' => null, 'suffix' => null, 'label' => 'Multidisciplinary team', 'order' => 6],
            ['type' => 'qualitative', 'value' => null, 'suffix' => null, 'label' => 'Technology products in operation and under development', 'order' => 7],
            ['type' => 'qualitative', 'value' => null, 'suffix' => null, 'label' => 'Experience across humanitarian, development, government, and private sectors', 'order' => 8],
        ];

        foreach ($indicators as $indicator) {
            TrustIndicator::query()->updateOrCreate(['label' => $indicator['label']], $indicator);
        }
    }
}
