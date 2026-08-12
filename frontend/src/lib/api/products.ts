import { ApiError, apiFetch, type ApiCollectionResponse, type ApiSingleResponse } from "@/lib/api/client";
import type { Product } from "@/types/product";

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 1,
    slug: "result-campus",
    name: "Result Campus",
    category: "Higher Education Management System",
    shortDescription: "Higher Education Management System",
    description: "Result Campus is a comprehensive higher education management system designed for universities, polytechnics, colleges of education, colleges of nursing, and other tertiary institutions. It streamlines academic, administrative, financial, and student management processes within a unified digital platform.",
    status: "operational",
    externalUrl: "https://resultcampus.com",
    targetUsers: ["Universities", "Polytechnics", "Colleges of Education", "Colleges of Nursing", "Professional Institutions", "Training Institutes"],
    features: [
      "Student Admissions & Enrollment Portal",
      "Academic & Transcript Management System",
      "Fee Payment & Billing Gateway",
      "Course Registration & Result Computation",
      "Lecturer & Staff Administration",
      "Alumni & Certificate Verification"
    ],
    logoPath: null,
    order: 1,
  },
  {
    id: 2,
    slug: "resultsms",
    name: "ResultSMS",
    category: "School Management System",
    shortDescription: "School Management System",
    description: "ResultSMS is a comprehensive school management system designed specifically for nursery, primary, and secondary schools. It helps schools manage admissions, student records, attendance, assessments, examinations, communication, finance, and administration from a single platform.",
    status: "operational",
    externalUrl: "https://resultsms.com",
    targetUsers: ["Nursery Schools", "Primary Schools", "Secondary Schools", "Private Schools", "Faith-Based Schools", "International Schools"],
    features: [
      "Automated Report Card Generation",
      "Parent & Student Portal",
      "Fee Management & SMS Alerts",
      "Attendance & Assessment Tracker",
      "Teacher Lesson Planning Tools"
    ],
    logoPath: null,
    order: 2,
  },
  {
    id: 3,
    slug: "makaranta",
    name: "Makaranta",
    category: "Digital Learning Marketplace",
    shortDescription: "Digital Learning Marketplace",
    description: "Makaranta is a digital learning marketplace that enables individuals and organizations to create, deliver, and access high-quality online learning content and professional development opportunities.",
    status: "operational",
    externalUrl: "https://makaranta.ng",
    targetUsers: ["Students", "Professionals", "Organizations", "Trainers", "Institutions"],
    features: [
      "Interactive E-Learning Courses",
      "Certified Professional Training Programs",
      "Instructor Content Marketplace",
      "Mobile-Friendly Learning Experience"
    ],
    logoPath: null,
    order: 3,
  },
  {
    id: 4,
    slug: "taska",
    name: "Taska",
    category: "Business & Professional Services Management Platform",
    shortDescription: "Business & Professional Services Management Platform",
    description: "Taska is a business and professional services management platform designed to help organizations manage operations, projects, customers, finance, workflows, and organizational performance.",
    status: "under_development",
    externalUrl: "https://taska.ng",
    targetUsers: ["SMEs", "Consulting Firms", "NGOs", "Service Providers", "Professional Practices"],
    features: [
      "Project & Task Management",
      "Invoicing & Client Billing",
      "Team Collaboration & Workflow Automation",
      "KPI & Performance Tracking"
    ],
    logoPath: null,
    order: 4,
  },
  {
    id: 5,
    slug: "swifta",
    name: "SWIFTA",
    category: "Logistics & Operations Platform",
    shortDescription: "Logistics & Operations Platform",
    description: "SWIFTA is a logistics and operations platform that supports transportation, fleet coordination, deliveries, dispatch operations, and operational management.",
    status: "under_development",
    externalUrl: "https://swifta.ng",
    targetUsers: ["Logistics Companies", "Fleet Operators", "Transport Businesses", "Organizations with field operations"],
    features: [
      "Real-Time Fleet Tracking",
      "Dispatch & Delivery Routing",
      "Driver Performance Monitoring",
      "Fuel & Maintenance Auditing"
    ],
    logoPath: null,
    order: 5,
  },
  {
    id: 6,
    slug: "swifta-watch",
    name: "SWIFTA Watch",
    category: "Security & Decision Intelligence Platform",
    shortDescription: "Security & Decision Intelligence Platform",
    description: "SWIFTA Watch is a security and decision intelligence platform that integrates data, situational awareness, monitoring, mapping, analytics, and intelligence to support informed decision-making.",
    status: "concept",
    externalUrl: "https://watch.swifta.ng",
    targetUsers: ["Government", "Security Organizations", "Humanitarian Agencies", "NGOs", "Emergency Management Organizations"],
    features: [
      "Geospatial Threat Mapping",
      "Early Warning & Alert Notifications",
      "Incident Response Dashboards",
      "Multi-Agency Intelligence Sharing"
    ],
    logoPath: null,
    order: 6,
  },
  {
    id: 7,
    slug: "the-citizen-reports",
    name: "The Citizen Reports (TCR)",
    category: "Online Media Platform",
    shortDescription: "Online Media Platform in Nigeria",
    description: "The Citizen Reports (TCR) is an online media platform in Nigeria focused on publishing news, analysis, public interest stories, and evidence-informed reporting.",
    status: "operational",
    externalUrl: "https://tcr.ng",
    targetUsers: ["Citizens", "Journalists", "Researchers", "Development Partners", "Government", "General Public"],
    features: [
      "Evidence-Informed Investigative Journalism",
      "Public Interest Policy Analysis",
      "Multimedia News & Opinion Content",
      "Community Engagement Portals"
    ],
    logoPath: null,
    order: 7,
  },
];

/**
 * Fetches the product catalogue for nav/footer use.
 * Falls back to seeded products on API failure.
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const { data } = await apiFetch<ApiCollectionResponse<Product>>("/products");
    if (data && data.length > 0) return data;
    return FALLBACK_PRODUCTS;
  } catch (error) {
    console.warn("API unreachable, using fallback products:", error);
    return FALLBACK_PRODUCTS;
  }
}

export type GetProductResult =
  | { status: "found"; product: Product }
  | { status: "not-found" }
  | { status: "error" };

/**
 * Fetches a single product by slug for the Product Detail Page.
 * Falls back to seeded product on API failure.
 */
export async function getProduct(slug: string): Promise<GetProductResult> {
  try {
    const { data } = await apiFetch<ApiSingleResponse<Product>>(`/products/${slug}`);
    return { status: "found", product: data };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { status: "not-found" };
    }
    const fallback = FALLBACK_PRODUCTS.find((p) => p.slug === slug);
    if (fallback) {
      return { status: "found", product: fallback };
    }
    console.warn(`API unreachable for product "${slug}", no fallback found:`, error);
    return { status: "error" };
  }
}
