import { ApiError, apiFetch, type ApiCollectionResponse, type ApiSingleResponse } from "@/lib/api/client";
import type { Solution } from "@/types/solution";

export const FALLBACK_SOLUTIONS: Solution[] = [
  {
    id: 1,
    slug: "research-evidence",
    name: "Research & Evidence",
    summary: "Helping organizations generate reliable evidence for planning, policy, programming, and decision-making through research, assessments, surveys, and evaluations.",
    icon: null,
    heroHeading: "Rigorous Research & Evidence Generation",
    heroDescription: "Generating actionable insights and empirical evidence to power sustainable development, public policy, and organizational strategies across Africa.",
    problemStatement: "Organizations often make critical strategic and policy decisions based on incomplete or unverified data, leading to misallocated resources and sub-optimal impact.",
    ourApproach: "We deploy mixed-methods research frameworks, rigorous field sampling, and advanced data collection instruments to deliver bulletproof insights.",
    services: ["Baseline Studies", "Endline Studies", "Surveys", "Needs Assessments", "Evaluations", "Policy Research", "Market Research", "Assessments", "Data Collection"],
    outputs: ["Comprehensive Research Reports", "Policy Briefs", "Statistical Datasets", "Executive Summaries"],
    tools: ["CSPro", "KoboToolbox", "STATA", "SPSS", "R", "Python"],
    order: 1,
  },
  {
    id: 2,
    slug: "monitoring-evaluation-learning",
    name: "Monitoring, Evaluation & Learning",
    summary: "Designing and strengthening MEAL systems that enable organizations to measure performance, improve programmes, and learn from implementation.",
    icon: null,
    heroHeading: "Results-Driven MEAL Systems & Impact Evaluation",
    heroDescription: "Transforming project monitoring into continuous organizational learning and measurable social impact.",
    problemStatement: "Without robust monitoring frameworks, projects struggle to track indicators, demonstrate accountability to donors, or adapt during execution.",
    ourApproach: "We build digital-first MEAL architectures with real-time tracking, standard indicator banks, and structured adaptive learning cycles.",
    services: ["MEAL Systems", "Results Frameworks", "Indicators", "Monitoring Systems", "Evaluations", "Learning", "Accountability", "Reporting"],
    outputs: ["MEAL Framework Documents", "Indicator Tracking Tables", "Mid-Term & Final Evaluation Reports"],
    tools: ["Logframe Matrices", "Theory of Change", "Power BI", "KoboToolbox"],
    order: 2,
  },
  {
    id: 3,
    slug: "data-ai-geospatial-intelligence",
    name: "Data, AI & Geospatial Intelligence",
    summary: "Transforming complex datasets into actionable insights through analytics, dashboards, artificial intelligence, GIS, mapping, and decision intelligence.",
    icon: null,
    heroHeading: "Data, Artificial Intelligence & Geospatial Analytics",
    heroDescription: "Leveraging cutting-edge AI, machine learning, and satellite geospatial analysis for high-precision decision intelligence.",
    problemStatement: "Modern decision-makers are inundated with raw data but lack interactive tools to spatialise and model future outcomes.",
    ourApproach: "We build custom machine learning pipelines and interactive GIS spatial maps to illuminate patterns and optimize field operations.",
    services: ["Dashboards", "GIS", "Remote Sensing", "AI", "Business Intelligence", "Data Engineering", "Analytics", "Mapping"],
    outputs: ["Interactive Web Dashboards", "High-Resolution Spatial Maps", "Predictive ML Models"],
    tools: ["QGIS", "ArcGIS", "Python", "TensorFlow", "PostGIS"],
    order: 3,
  },
  {
    id: 4,
    slug: "digital-platforms-software-engineering",
    name: "Digital Platforms & Software Engineering",
    summary: "Building secure, scalable, and user-centred digital platforms, enterprise systems, mobile applications, APIs, and automation solutions.",
    icon: null,
    heroHeading: "Enterprise Software Engineering & Cloud Platforms",
    heroDescription: "Designing resilient, high-performance web systems, cloud architectures, and digital products for governments and enterprises.",
    problemStatement: "Off-the-shelf software often fails to meet complex organizational workflows, security standards, and local user contexts.",
    ourApproach: "We build custom, cloud-native applications with modern frameworks, API-first architecture, and intuitive user experiences.",
    services: ["Websites", "Enterprise Platforms", "Mobile Apps", "APIs", "Databases", "Automation", "Digital Products", "Cloud Systems"],
    outputs: ["Web & Mobile Applications", "RESTful API Endpoints", "System Architecture Documentation"],
    tools: ["Next.js", "Laravel", "PostgreSQL", "Docker", "AWS"],
    order: 4,
  },
  {
    id: 5,
    slug: "learning-institutional-development",
    name: "Learning & Institutional Development",
    summary: "Strengthening institutional capacity through professional training, coaching, mentoring, workshops, and customized learning programmes.",
    icon: null,
    heroHeading: "Capacity Building & Corporate Learning Systems",
    heroDescription: "Empowering teams and leaders with practical technical skills, modern management tools, and continuous learning culture.",
    problemStatement: "Skill gaps and rapid technological change reduce organizational efficiency and slow down strategic execution.",
    ourApproach: "We deliver tailored blended-learning curricula, hands-on workshops, and executive coaching backed by modern LMS platforms.",
    services: ["Training", "Coaching", "Mentoring", "Workshops", "Professional Development", "Capacity Building", "Academy Programmes"],
    outputs: ["Custom Training Curricula", "LMS E-Learning Modules", "Post-Training Evaluation Reports"],
    tools: ["Moodle", "Result Academy LMS", "Interactive Workshops"],
    order: 5,
  },
  {
    id: 6,
    slug: "digital-transformation-advisory",
    name: "Digital Transformation & Advisory",
    summary: "Supporting organizations in adopting digital technologies, redesigning business processes, improving governance, and driving innovation.",
    icon: null,
    heroHeading: "Strategic Digital Transformation & Tech Advisory",
    heroDescription: "Guiding organizations through seamless technology adoption, operational automation, and digital change management.",
    problemStatement: "Legacy operating models and fragmented tech adoption limit organizational agility and increase operational risk.",
    ourApproach: "We assess digital maturity, design target operating models, and guide change management to ensure tech investments deliver maximum ROI.",
    services: ["Digital Strategy", "Process Automation", "Technology Advisory", "Innovation", "Change Management", "Digital Governance"],
    outputs: ["Digital Transformation Roadmaps", "Standard Operating Procedures (SOPs)", "Technology Audit Reports"],
    tools: ["BPMN 2.0", "Enterprise Architecture Frameworks", "TOGAF"],
    order: 6,
  },
];

/**
 * Fetches the six solution areas for nav/footer use.
 *
 * Falls back to seeded solutions on API error.
 */
export async function getSolutions(): Promise<Solution[]> {
  try {
    const { data } = await apiFetch<ApiCollectionResponse<Solution>>("/solutions");
    if (data && data.length > 0) return data;
    return FALLBACK_SOLUTIONS;
  } catch (error) {
    console.warn("API unreachable, using fallback solutions:", error);
    return FALLBACK_SOLUTIONS;
  }
}

export type GetSolutionResult =
  | { status: "found"; solution: Solution }
  | { status: "not-found" }
  | { status: "error" };

/**
 * Fetches a single solution by slug for the Solution Detail Page.
 * Falls back to seeded solution if API is unreachable.
 */
export async function getSolution(slug: string): Promise<GetSolutionResult> {
  try {
    const { data } = await apiFetch<ApiSingleResponse<Solution>>(`/solutions/${slug}`);
    return { status: "found", solution: data };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { status: "not-found" };
    }
    const fallback = FALLBACK_SOLUTIONS.find((s) => s.slug === slug);
    if (fallback) {
      return { status: "found", solution: fallback };
    }
    console.warn(`API unreachable for solution "${slug}", no fallback found:`, error);
    return { status: "error" };
  }
}
