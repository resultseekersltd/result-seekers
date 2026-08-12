import {
  ClipboardCheck,
  Code2,
  Database,
  GraduationCap,
  SearchCheck,
  Workflow,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps each of the six approved solution slugs to a representative Lucide
 * icon. The API's `icon` field is currently null for every seeded
 * solution, and resolving an arbitrary string to a component is a
 * page-level concern (see SolutionCard's doc comment) — this is that
 * mapping, keyed by the fixed, known set of solution slugs.
 */
export const SOLUTION_ICONS: Record<string, LucideIcon> = {
  "research-evidence": SearchCheck,
  "monitoring-evaluation-learning": ClipboardCheck,
  "data-ai-geospatial-intelligence": Database,
  "digital-platforms-software-engineering": Code2,
  "learning-institutional-development": GraduationCap,
  "digital-transformation-advisory": Workflow,
};
