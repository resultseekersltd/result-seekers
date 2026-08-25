// ─────────────────────────────────────────────────────────────────────────────
// Organisation — TypeScript types matching the Laravel API Resources
// ─────────────────────────────────────────────────────────────────────────────

export interface OrganisationUser {
  id: number;
  name: string;
  email: string;
  role: string;
  email_verified_at: string | null;
  is_active: boolean;
  mfa_enabled: boolean;
  organisation_id: string;
  created_at: string | null;
}

export interface Organisation {
  id: string;
  name: string;
  slug: string;
  legal_name: string | null;
  trading_name: string | null;
  organisation_type: string | null;
  sector: string | null;
  country: string | null;
  state: string | null;
  registered_address: string | null;
  website: string | null;
  registration_number: string | null;
  profile_description: string | null;
  recruitment_needs: string | null;
  status: string;
  status_label: string;
  verified_at: string | null;
  created_at: string | null;
}

export interface TalentRequest {
  id: string;
  reference: string;
  service_type: string;
  title: string;
  number_required: number;
  location: string | null;
  arrangement: string | null;
  engagement_type: string | null;
  duration: string | null;
  start_date: string | null;
  deadline: string | null;
  description: string;
  essential_qualifications: string | null;
  desirable_qualifications: string | null;
  years_experience_required: number | null;
  required_skills: string[] | null;
  budget_range: string | null;
  confidentiality_level: string;
  details: Record<string, unknown> | null;
  status: string;
  submitted_at: string | null;
  created_at: string | null;
}

export interface TalentRequestPayload {
  service_type: string;
  title: string;
  number_required?: number;
  location?: string;
  arrangement?: string;
  engagement_type?: string;
  duration?: string;
  start_date?: string;
  deadline?: string;
  description: string;
  essential_qualifications?: string;
  desirable_qualifications?: string;
  years_experience_required?: number;
  required_skills?: string[];
  budget_range?: string;
  confidentiality_level?: string;
  details?: Record<string, unknown>;
}

export interface OrganisationAuthResponse {
  token?: string;
  user: OrganisationUser;
  mfa_required?: boolean;
  mfa_token?: string;
  mfa_setup_required?: boolean;
}

export interface OrganisationLoginResponse {
  token?: string;
  user?: OrganisationUser;
  mfa_required?: boolean;
  mfa_token?: string;
  mfa_setup_required?: boolean;
}

export interface PaginatedMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// ─── Released Candidates (Phase 2 — Controlled Data Release) ──────────────────
//
// `candidate` is rendered directly from Laravel's DataRelease::released_fields
// allowlist snapshot — never a live profile join — so its shape is exactly
// whatever CandidateReleaseController::ALLOWED_FIELDS put there.

export interface ReleasedCandidateFields {
  candidate_reference: string;
  professional_title: string | null;
  years_experience: number | null;
  highest_qualification: string | null;
  country: string | null;
  state: string | null;
  disciplines: string[];
  industries: string[] | null;
  languages: string[] | null;
  verification_level: string | null;
}

export interface ReleasedCandidate {
  id: string;
  candidate: ReleasedCandidateFields;
  purpose: string | null;
  released_at: string | null;
  organisation_status: "pending" | "interested" | "not_interested" | null;
  comments_count?: number;
}

export interface ReleasedCandidateComment {
  id: string;
  comment: string;
  created_at: string;
}

// ─── Interviews & Candidate Evaluation (Phase 3 — Evaluation Workflow) ────────
//
// Interview is only ever visible for a candidate already released to this
// organisation — see InterviewPolicy on the backend. `my_scorecard` is
// populated only when the viewing organisation user is themself a panel
// member; no other panelist's scoring is ever exposed here.

export interface OrganisationInterview {
  id: string;
  type: string;
  scheduled_at: string | null;
  timezone: string | null;
  location_or_link: string | null;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show" | "rescheduled";
  status_label: string;
  is_panel_member: boolean;
  my_scorecard: {
    id: string;
    competency_scores: Record<string, unknown> | null;
    panel_comments: string | null;
    overall_recommendation: string | null;
    submitted_at: string | null;
  } | null;
}

export interface OrganisationPlacement {
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

export interface OrganisationAssignmentFeedback {
  id: string;
  rating: number | null;
  comments: string | null;
  submitted_at: string | null;
  is_mine: boolean;
}

export interface CandidateEvaluation {
  id: string;
  data_release_id: string;
  organisation_user_id: number;
  evaluator_name: string | null;
  score: string | null;
  criteria_notes: string | null;
  recommendation: string | null;
  final_outcome: "pending" | "selected" | "not_selected" | null;
  created_at: string | null;
  updated_at: string | null;
}
