<?php

namespace Database\Seeders;

use App\Models\Solution;
use Illuminate\Database\Seeder;

/**
 * The six official solution areas — copy verbatim from
 * 05_Content_and_Product_Specification.md §5 and
 * 03_Feature_Specification.md §5 (service lists). Do not add, remove, or
 * reword entries here without checking those docs first.
 */
class SolutionSeeder extends Seeder
{
    public function run(): void
    {
        $solutions = [
            [
                'slug' => 'research-evidence',
                'name' => 'Research & Evidence',
                'summary' => 'Helping organizations generate reliable evidence for planning, policy, programming, and decision-making through research, assessments, surveys, and evaluations.',
                'services' => ['Baseline Studies', 'Endline Studies', 'Surveys', 'Needs Assessments', 'Evaluations', 'Policy Research', 'Market Research', 'Assessments', 'Data Collection'],
                'order' => 1,
            ],
            [
                'slug' => 'monitoring-evaluation-learning',
                'name' => 'Monitoring, Evaluation & Learning',
                'summary' => 'Designing and strengthening MEAL systems that enable organizations to measure performance, improve programmes, and learn from implementation.',
                'services' => ['MEAL Systems', 'Results Frameworks', 'Indicators', 'Monitoring Systems', 'Evaluations', 'Learning', 'Accountability', 'Reporting'],
                'order' => 2,
            ],
            [
                'slug' => 'data-ai-geospatial-intelligence',
                'name' => 'Data, AI & Geospatial Intelligence',
                'summary' => 'Transforming complex datasets into actionable insights through analytics, dashboards, artificial intelligence, GIS, mapping, and decision intelligence.',
                'services' => ['Dashboards', 'GIS', 'Remote Sensing', 'AI', 'Business Intelligence', 'Data Engineering', 'Analytics', 'Mapping'],
                'order' => 3,
            ],
            [
                'slug' => 'digital-platforms-software-engineering',
                'name' => 'Digital Platforms & Software Engineering',
                'summary' => 'Building secure, scalable, and user-centred digital platforms, enterprise systems, mobile applications, APIs, and automation solutions.',
                'services' => ['Websites', 'Enterprise Platforms', 'Mobile Apps', 'APIs', 'Databases', 'Automation', 'Digital Products', 'Cloud Systems'],
                'order' => 4,
            ],
            [
                'slug' => 'learning-institutional-development',
                'name' => 'Learning & Institutional Development',
                'summary' => 'Strengthening institutional capacity through professional training, coaching, mentoring, workshops, and customized learning programmes.',
                'services' => ['Training', 'Coaching', 'Mentoring', 'Workshops', 'Professional Development', 'Capacity Building', 'Academy Programmes'],
                'order' => 5,
            ],
            [
                'slug' => 'digital-transformation-advisory',
                'name' => 'Digital Transformation & Advisory',
                'summary' => 'Supporting organizations in adopting digital technologies, redesigning business processes, improving governance, and driving innovation.',
                'services' => ['Digital Strategy', 'Process Automation', 'Technology Advisory', 'Innovation', 'Change Management', 'Digital Governance'],
                'order' => 6,
            ],
        ];

        foreach ($solutions as $solution) {
            Solution::query()->updateOrCreate(['slug' => $solution['slug']], $solution);
        }
    }
}
