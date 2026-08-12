<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

/**
 * The seven Result Seekers products — copy verbatim from
 * 05_Content_and_Product_Specification.md §6. Descriptions, target users,
 * statuses, and external links must not be changed without checking that
 * doc first — "Product accuracy is mandatory" per the master prompt.
 */
class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'slug' => 'result-campus',
                'name' => 'Result Campus',
                'category' => 'Higher Education Management System',
                'short_description' => 'Higher Education Management System',
                'description' => 'Result Campus is a comprehensive higher education management system designed for universities, polytechnics, colleges of education, colleges of nursing, and other tertiary institutions. It streamlines academic, administrative, financial, and student management processes within a unified digital platform.',
                'status' => 'operational',
                'external_url' => 'https://resultcampus.com',
                'target_users' => ['Universities', 'Polytechnics', 'Colleges of Education', 'Colleges of Nursing', 'Professional Institutions', 'Training Institutes'],
                'order' => 1,
            ],
            [
                'slug' => 'resultsms',
                'name' => 'ResultSMS',
                'category' => 'School Management System',
                'short_description' => 'School Management System',
                'description' => 'ResultSMS is a comprehensive school management system designed specifically for nursery, primary, and secondary schools. It helps schools manage admissions, student records, attendance, assessments, examinations, communication, finance, and administration from a single platform.',
                'status' => 'operational',
                'external_url' => 'https://resultsms.com',
                'target_users' => ['Nursery Schools', 'Primary Schools', 'Secondary Schools', 'Private Schools', 'Faith-Based Schools', 'International Schools'],
                'order' => 2,
            ],
            [
                'slug' => 'makaranta',
                'name' => 'Makaranta',
                'category' => 'Digital Learning Marketplace',
                'short_description' => 'Digital Learning Marketplace',
                'description' => 'Makaranta is a digital learning marketplace that enables individuals and organizations to create, deliver, and access high-quality online learning content and professional development opportunities.',
                'status' => 'operational',
                'external_url' => 'https://makaranta.ng',
                'target_users' => ['Students', 'Professionals', 'Organizations', 'Trainers', 'Institutions'],
                'order' => 3,
            ],
            [
                'slug' => 'taska',
                'name' => 'Taska',
                'category' => 'Business & Professional Services Management Platform',
                'short_description' => 'Business & Professional Services Management Platform',
                'description' => 'Taska is a business and professional services management platform designed to help organizations manage operations, projects, customers, finance, workflows, and organizational performance.',
                'status' => 'under_development',
                'external_url' => 'https://taska.ng',
                'target_users' => ['SMEs', 'Consulting Firms', 'NGOs', 'Service Providers', 'Professional Practices'],
                'order' => 4,
            ],
            [
                'slug' => 'swifta',
                'name' => 'SWIFTA',
                'category' => 'Logistics & Operations Platform',
                'short_description' => 'Logistics & Operations Platform',
                'description' => 'SWIFTA is a logistics and operations platform that supports transportation, fleet coordination, deliveries, dispatch operations, and operational management.',
                'status' => 'under_development',
                'external_url' => 'https://swifta.ng',
                'target_users' => ['Logistics Companies', 'Fleet Operators', 'Transport Businesses', 'Organizations with field operations'],
                'order' => 5,
            ],
            [
                'slug' => 'swifta-watch',
                'name' => 'SWIFTA Watch',
                'category' => 'Security & Decision Intelligence Platform',
                'short_description' => 'Security & Decision Intelligence Platform',
                'description' => 'SWIFTA Watch is a security and decision intelligence platform that integrates data, situational awareness, monitoring, mapping, analytics, and intelligence to support informed decision-making.',
                'status' => 'concept',
                'external_url' => 'https://watch.swifta.ng',
                'target_users' => ['Government', 'Security Organizations', 'Humanitarian Agencies', 'NGOs', 'Emergency Management Organizations'],
                'order' => 6,
            ],
            [
                'slug' => 'the-citizen-reports',
                'name' => 'The Citizen Reports (TCR)',
                'category' => 'Online Media Platform',
                'short_description' => 'Online Media Platform in Nigeria',
                'description' => 'The Citizen Reports (TCR) is an online media platform in Nigeria focused on publishing news, analysis, public interest stories, and evidence-informed reporting.',
                'status' => 'operational',
                'external_url' => 'https://tcr.ng',
                'target_users' => ['Citizens', 'Journalists', 'Researchers', 'Development Partners', 'Government', 'General Public'],
                'order' => 7,
            ],
        ];

        foreach ($products as $product) {
            Product::query()->updateOrCreate(['slug' => $product['slug']], $product);
        }
    }
}
