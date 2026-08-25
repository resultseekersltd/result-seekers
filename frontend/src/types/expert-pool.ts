// ─────────────────────────────────────────────────────────────────────────────
// Expert Pool — TypeScript types matching the Laravel API Resources
// ─────────────────────────────────────────────────────────────────────────────

export interface ExpertUser {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  is_active: boolean;
  mfa_enabled: boolean;
  created_at: string | null;
}

export interface ExpertDiscipline {
  id: number;
  name: string;
  slug: string;
}

export interface ExpertExperience {
  id: number;
  organization: string;
  job_title: string;
  country: string | null;
  start_date: string; // "YYYY-MM-DD"
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ExpertEducation {
  id: number;
  institution: string;
  qualification: string;
  field_of_study: string | null;
  start_year: number;
  end_year: number | null;
  country: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ExpertProfile {
  id: number;
  expert_user_id: number;

  // Personal
  preferred_name: string | null;
  phone: string | null;
  country: string | null;
  state: string | null;
  city: string | null;

  // Professional
  professional_title: string | null;
  current_organization: string | null;
  years_experience: number | null;
  highest_qualification: string | null;
  field_of_study: string | null;
  bio: string | null;
  skills: string[];
  industries: string[];
  languages: string[];
  certifications: string[];

  // Disciplines
  disciplines?: ExpertDiscipline[];

  // CV (path never exposed)
  has_cv: boolean;
  cv_original_name: string | null;
  cv_uploaded_at: string | null;

  // Workflow
  status: "incomplete" | "complete" | "submitted" | "under_review" | "approved" | "rejected" | "suspended";
  submitted_at: string | null;
  reviewed_at: string | null;

  // Completion
  completion_percentage: number;
  completion_missing: string[];

  // Relations
  experiences?: ExpertExperience[];
  education?: ExpertEducation[];

  updated_at: string | null;
}

// ─── BFF response shapes ─────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  user: ExpertUser;
}

export interface MfaPendingResponse {
  mfa_required: true;
  mfa_token: string;
}

export type LoginResponse = AuthResponse | MfaPendingResponse;

export interface ProfileUpdatePayload {
  preferred_name?: string | null;
  phone?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  professional_title?: string | null;
  current_organization?: string | null;
  years_experience?: number | null;
  highest_qualification?: string | null;
  field_of_study?: string | null;
  bio?: string | null;
  skills?: string[];
  industries?: string[];
  languages?: string[];
  certifications?: string[];
  discipline_ids?: number[];
}

export interface ExperiencePayload {
  organization: string;
  job_title: string;
  country?: string | null;
  start_date: string;
  end_date?: string | null;
  is_current?: boolean;
  description?: string | null;
}

export interface EducationPayload {
  institution: string;
  qualification: string;
  field_of_study?: string | null;
  start_year: number;
  end_year?: number | null;
  country?: string | null;
}

// ─── Opportunities & Consent (Phase 2 — Managed Recruitment Pipeline) ─────────
//
// Deliberately does not expose which organisation an opportunity is for —
// the source documents only authorize disclosing that at consent-request
// time, not before (see OpportunityResource's own docblock on the backend).

export interface Opportunity {
  id: string;
  status: "sent" | "accepted" | "declined" | "expired" | "withdrawn";
  sent_at: string | null;
  responded_at: string | null;
  expires_at: string | null;
  assignment_reference: string | null;
  stage: string | null;
}

export interface Consent {
  id: string;
  purpose: string | null;
  consent_text_version: string | null;
  status: "requested" | "consented" | "declined" | "withdrawn";
  requested_at: string | null;
  responded_at: string | null;
  consented_at: string | null;
  declined_at: string | null;
  withdrawn_at: string | null;
}

// ─── Assessments & Interviews (Phase 3 — Evaluation Workflow) ─────────────────
//
// Never exposes reviewer identity, criteria breakdown, panel data, or
// interviewer notes — see AssessmentResource/InterviewResource's own
// docblocks on the backend for the exact privacy boundary.

export interface AssessmentSubmission {
  id: string;
  attempt_number: number;
  response_text: string | null;
  has_file: boolean;
  file_original_name: string | null;
  answers: Record<string, unknown> | null;
  submitted_at: string | null;
}

export interface Assessment {
  id: string;
  type: string;
  title: string;
  instructions: string | null;
  time_limit_minutes: number | null;
  starts_at: string | null;
  closes_at: string | null;
  attempt_limit: number | null;
  status: "assigned" | "in_progress" | "submitted" | "under_review" | "reviewed" | "expired" | "cancelled";
  status_label: string;
  my_submission: AssessmentSubmission | null;
  result: { score: string; max_score: string } | null;
}

export interface Interview {
  id: string;
  type: string;
  scheduled_at: string | null;
  timezone: string | null;
  location_or_link: string | null;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show" | "rescheduled";
  status_label: string;
  candidate_confirmed_at: string | null;
}

export interface Placement {
  id: string;
  engagement_type: string | null;
  start_date: string | null;
  end_date: string | null;
  deployment_location: string | null;
  deployment_notes: string | null;
  onboarding_notes: string | null;
  status: "pending_confirmation" | "confirmed" | "cancelled";
  status_label: string;
  organisation_confirmed_at: string | null;
  professional_confirmed_at: string | null;
}

export interface AssignmentFeedback {
  id: string;
  rating: number | null;
  comments: string | null;
  submitted_at: string | null;
  is_mine: boolean;
}
