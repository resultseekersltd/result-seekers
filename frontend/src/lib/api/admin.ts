/**
 * Admin — BFF API client
 *
 * All functions call the Next.js BFF Route Handlers under /api/admin/,
 * which forward to Laravel and manage the secure httpOnly session cookie.
 * Nothing in this file calls Laravel directly — mirrors
 * src/lib/api/expert-pool.ts's pattern exactly.
 *
 * CMS content types (Solutions/Products/Articles/etc.) share one generic
 * CRUD surface (listResource/getResource/createResource/updateResource/
 * deleteResource) instead of twelve near-identical sets of named
 * functions, since every one of them is a plain {data, meta} / {data}
 * envelope over /api/admin/cms/{resource}[/{id}].
 */

export class AdminApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.errors = errors;
  }
}

export interface AdminPaginatedResponse<T> {
  data: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export interface AdminSingleResponse<T> {
  data: T;
}

async function bff<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/admin${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init.headers,
    },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new AdminApiError(json.message ?? `Request failed (${res.status})`, res.status, json.errors);
  }

  return json as T;
}

async function bffForm<T>(path: string, body: FormData): Promise<T> {
  const res = await fetch(`/api/admin${path}`, {
    method: "POST",
    body,
    headers: { Accept: "application/json" },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new AdminApiError(json.message ?? `Request failed (${res.status})`, res.status, json.errors);
  }

  return json as T;
}

// ─── Auth ───────────────────────────────────────────────────────────────

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  mfa_enabled: boolean;
  created_at: string;
}

export type AdminLoginResponse =
  | { mfa_required: true; mfa_token: string }
  | { user: AdminUser; mfa_setup_required: true };

export function login(email: string, password: string): Promise<AdminLoginResponse> {
  return bff("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

export function logout(): Promise<{ message: string }> {
  return bff("/auth/logout", { method: "POST" });
}

export function me(): Promise<{ user: AdminUser }> {
  return bff("/auth/me");
}

export function changePassword(payload: {
  current_password: string;
  password: string;
  password_confirmation: string;
}): Promise<{ message: string }> {
  return bff("/auth/change-password", { method: "POST", body: JSON.stringify(payload) });
}

// ─── MFA ────────────────────────────────────────────────────────────────

export function mfaSetup(): Promise<{ secret: string; qr_url: string }> {
  return bff("/mfa/setup");
}

export function mfaConfirm(code: string): Promise<{ message: string; recovery_codes: string[] }> {
  return bff("/mfa/confirm", { method: "POST", body: JSON.stringify({ code }) });
}

export function mfaVerify(
  code: string,
  mfaToken: string,
  recoveryMode = false,
): Promise<{ user: AdminUser }> {
  return bff("/mfa/verify", {
    method: "POST",
    headers: { "X-MFA-Token": mfaToken },
    body: JSON.stringify({ code, recovery_mode: recoveryMode }),
  });
}

export function mfaDisable(password: string): Promise<{ message: string }> {
  return bff("/mfa/disable", { method: "POST", body: JSON.stringify({ password }) });
}

export function recoveryCodesStatus(): Promise<{ unused_recovery_codes: number }> {
  return bff("/mfa/recovery-codes");
}

export function regenerateRecoveryCodes(
  password: string,
): Promise<{ message: string; recovery_codes: string[] }> {
  return bff("/mfa/recovery-codes/regenerate", { method: "POST", body: JSON.stringify({ password }) });
}

// ─── CMS — generic CRUD over /api/admin/cms/{resource} ───────────────────

export function listResource<T>(
  resource: string,
  params: Record<string, string> = {},
): Promise<AdminPaginatedResponse<T>> {
  const qs = new URLSearchParams(params).toString();
  return bff(`/cms/${resource}${qs ? `?${qs}` : ""}`);
}

export function getResource<T>(resource: string, id: number | string): Promise<AdminSingleResponse<T>> {
  return bff(`/cms/${resource}/${id}`);
}

export function createResource<T>(resource: string, data: object): Promise<AdminSingleResponse<T>> {
  return bff(`/cms/${resource}`, { method: "POST", body: JSON.stringify(data) });
}

export function updateResource<T>(
  resource: string,
  id: number | string,
  data: object,
): Promise<AdminSingleResponse<T>> {
  return bff(`/cms/${resource}/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function deleteResource(resource: string, id: number | string): Promise<{ message: string }> {
  return bff(`/cms/${resource}/${id}`, { method: "DELETE" });
}

// ─── Media Library ─────────────────────────────────────────────────────

export interface Media {
  id: number;
  url: string;
  path: string;
  originalName: string;
  mimeType: string;
  size: number;
  altText: string | null;
  uploadedBy: string | null;
  createdAt: string;
}

export function listMedia(page = 1): Promise<AdminPaginatedResponse<Media>> {
  return bff(`/media?page=${page}`);
}

export function uploadMedia(file: File, altText?: string): Promise<AdminSingleResponse<Media>> {
  const form = new FormData();
  form.append("file", file);
  if (altText) form.append("alt_text", altText);
  return bffForm("/media", form);
}

export function deleteMedia(id: number): Promise<{ message: string }> {
  return bff(`/media/${id}`, { method: "DELETE" });
}

// ─── Expert Pool management ──────────────────────────────────────────────

export interface AdminExpertProfile {
  id: number;
  preferred_name: string | null;
  phone: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
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
  disciplines: { id: number; name: string; slug: string }[];
  experiences: {
    id: number;
    organization: string;
    job_title: string;
    country: string | null;
    start_date: string | null;
    end_date: string | null;
    is_current: boolean;
    description: string | null;
  }[];
  education: {
    id: number;
    institution: string;
    qualification: string;
    field_of_study: string | null;
    start_year: number;
    end_year: number | null;
    country: string | null;
  }[];
  has_cv: boolean;
  cv_original_name: string | null;
  cv_uploaded_at: string | null;
  status: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  completion_percentage: number;
  completion_missing: string[];
  updated_at: string | null;
}

export interface AdminExpert {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  is_active: boolean;
  mfa_enabled: boolean;
  created_at: string;
  profile: AdminExpertProfile | null;
}

export function listExperts(
  params: { page?: number; search?: string; status?: string; country?: string; verified?: string } = {},
): Promise<AdminPaginatedResponse<AdminExpert>> {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  ).toString();
  return bff(`/cms/expert-pool${qs ? `?${qs}` : ""}`);
}

export function getExpert(id: number): Promise<AdminSingleResponse<AdminExpert>> {
  return bff(`/cms/expert-pool/${id}`);
}

export function updateExpertStatus(id: number, status: string): Promise<AdminSingleResponse<AdminExpert>> {
  return bff(`/cms/expert-pool/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export function toggleExpertActive(id: number, isActive: boolean): Promise<{ is_active: boolean }> {
  return bff(`/cms/expert-pool/${id}/active`, { method: "PATCH", body: JSON.stringify({ is_active: isActive }) });
}

// ─── Organisations (Phase 1) ──────────────────────────────────────────
//
// Reached via the same generic /cms/{resource} catch-all as CMS content —
// the Laravel routes live at admin/organisations, not admin/cms/..., but
// the frontend proxy strips the "cms" segment before building the Laravel
// path, so no dedicated BFF file is needed (see cms/[...path]/route.ts).

export interface AdminOrganisation {
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
  official_email_domain: string | null;
  contact_person_name: string | null;
  contact_person_position: string | null;
  contact_person_phone: string | null;
  registration_number: string | null;
  profile_description: string | null;
  recruitment_needs: string | null;
  terms_agreed: boolean;
  status: string;
  status_label: string;
  verified_at: string | null;
  users_count: number | null;
  created_at: string | null;
}

export function listOrganisations(
  params: { page?: number; search?: string; status?: string } = {},
): Promise<AdminPaginatedResponse<AdminOrganisation>> {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  ).toString();
  return bff(`/cms/organisations${qs ? `?${qs}` : ""}`);
}

export function getOrganisation(id: string): Promise<AdminSingleResponse<AdminOrganisation>> {
  return bff(`/cms/organisations/${id}`);
}

export function updateOrganisationStatus(id: string, status: string): Promise<AdminSingleResponse<AdminOrganisation>> {
  return bff(`/cms/organisations/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

// ─── Talent Requests (Phase 1) ────────────────────────────────────────

export interface AdminTalentRequest {
  id: string;
  reference: string;
  organisation_id: string;
  organisation_name: string | null;
  requested_by: string | null;
  assigned_recruiter_id: number | null;
  assigned_recruiter_name: string | null;
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

export function listTalentRequests(
  params: { page?: number; status?: string; organisation_id?: string } = {},
): Promise<AdminPaginatedResponse<AdminTalentRequest>> {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  ).toString();
  return bff(`/cms/talent-requests${qs ? `?${qs}` : ""}`);
}

export function getTalentRequest(id: string): Promise<AdminSingleResponse<AdminTalentRequest>> {
  return bff(`/cms/talent-requests/${id}`);
}

export function updateTalentRequestStatus(id: string, status: string): Promise<AdminSingleResponse<AdminTalentRequest>> {
  return bff(`/cms/talent-requests/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export function assignRecruiter(id: string, recruiterId: number): Promise<AdminSingleResponse<AdminTalentRequest>> {
  return bff(`/cms/talent-requests/${id}/assign-recruiter`, {
    method: "PATCH",
    body: JSON.stringify({ recruiter_id: recruiterId }),
  });
}

// ─── Recruitment Assignments & Candidate Pipeline (Phase 2) ───────────────────
//
// Reached via the same /cms/{resource} catch-all as Organisations/Talent
// Requests above (Laravel routes live at admin/recruitment-assignments and
// admin/candidate-consents, not admin/cms/...; the BFF strips the "cms"
// segment before building the Laravel path).

export interface RecruitmentAssignment {
  id: string;
  reference: string | null;
  talent_request_id: string;
  talent_request_title: string | null;
  organisation_id: string;
  organisation_name: string | null;
  recruiter_id: number;
  recruiter_name: string | null;
  status: "opened" | "completed" | "cancelled" | "archived";
  opened_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  archived_at: string | null;
  pipeline_count?: number;
}

export interface CandidatePipelineEntry {
  id: string;
  recruitment_assignment_id: string;
  expert_pool_profile_id: number;
  professional_title: string | null;
  stage: string;
  stage_label: string;
  outcome: string | null;
  outcome_reason: string | null;
  recruiter_notes: string | null;
  screening_decision: string | null;
  screening_notes: string | null;
  screened_at: string | null;
  quality_review_decision: string | null;
  quality_review_notes: string | null;
  quality_reviewed_at: string | null;
  invitation: { status: string; sent_at: string | null; responded_at: string | null } | null;
  latest_consent: { id: string; status: string } | null;
  created_at: string | null;
}

export function listRecruitmentAssignments(
  params: { page?: number; status?: string; recruiter_id?: string } = {},
): Promise<AdminPaginatedResponse<RecruitmentAssignment>> {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  ).toString();
  return bff(`/cms/recruitment-assignments${qs ? `?${qs}` : ""}`);
}

export function getRecruitmentAssignment(id: string): Promise<AdminSingleResponse<RecruitmentAssignment>> {
  return bff(`/cms/recruitment-assignments/${id}`);
}

export function createRecruitmentAssignment(talentRequestId: string): Promise<AdminSingleResponse<RecruitmentAssignment>> {
  return bff("/cms/recruitment-assignments", {
    method: "POST",
    body: JSON.stringify({ talent_request_id: talentRequestId }),
  });
}

export function updateRecruitmentAssignmentStatus(
  id: string,
  status: "completed" | "cancelled" | "archived",
): Promise<AdminSingleResponse<RecruitmentAssignment>> {
  return bff(`/cms/recruitment-assignments/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export function reassignRecruitmentAssignment(
  id: string,
  recruiterId: number,
): Promise<AdminSingleResponse<RecruitmentAssignment>> {
  return bff(`/cms/recruitment-assignments/${id}/reassign`, {
    method: "PATCH",
    body: JSON.stringify({ recruiter_id: recruiterId }),
  });
}

export function listPipelineEntries(
  assignmentId: string,
  params: { stage?: string } = {},
): Promise<AdminPaginatedResponse<CandidatePipelineEntry>> {
  const qs = new URLSearchParams(params).toString();
  return bff(`/cms/recruitment-assignments/${assignmentId}/pipeline${qs ? `?${qs}` : ""}`);
}

export function addPipelineEntry(
  assignmentId: string,
  expertPoolProfileId: number,
): Promise<AdminSingleResponse<CandidatePipelineEntry>> {
  return bff(`/cms/recruitment-assignments/${assignmentId}/pipeline`, {
    method: "POST",
    body: JSON.stringify({ expert_pool_profile_id: expertPoolProfileId }),
  });
}

export function screenPipelineEntry(
  assignmentId: string,
  entryId: string,
  decision: "eligible" | "not_eligible" | "needs_clarification",
  notes?: string,
): Promise<AdminSingleResponse<CandidatePipelineEntry>> {
  return bff(`/cms/recruitment-assignments/${assignmentId}/pipeline/${entryId}/screen`, {
    method: "POST",
    body: JSON.stringify({ decision, notes }),
  });
}

export function qualityReviewPipelineEntry(
  assignmentId: string,
  entryId: string,
  decision: "approved" | "rejected" | "changes_requested",
  notes?: string,
): Promise<AdminSingleResponse<CandidatePipelineEntry>> {
  return bff(`/cms/recruitment-assignments/${assignmentId}/pipeline/${entryId}/quality-review`, {
    method: "POST",
    body: JSON.stringify({ decision, notes }),
  });
}

export function invitePipelineEntry(
  assignmentId: string,
  entryId: string,
): Promise<{ data: { invitation_id: string; status: string; entry: CandidatePipelineEntry } }> {
  return bff(`/cms/recruitment-assignments/${assignmentId}/pipeline/${entryId}/invite`, { method: "POST" });
}

export function requestPipelineEntryConsent(
  assignmentId: string,
  entryId: string,
): Promise<{ data: { consent_id: string; entry: CandidatePipelineEntry } }> {
  return bff(`/cms/recruitment-assignments/${assignmentId}/pipeline/${entryId}/request-consent`, { method: "POST" });
}

export function approveCandidateRelease(consentId: string): Promise<{ data: { release_id: string } }> {
  return bff(`/cms/candidate-consents/${consentId}/release`, { method: "POST" });
}

// ─── Assessments, Interviews & Reference Checks (Phase 3) ─────────────────────

export interface AssessmentSubmissionView {
  id: string;
  attempt_number: number;
  response_text: string | null;
  has_file: boolean;
  file_original_name: string | null;
  answers: Record<string, unknown> | null;
  submitted_at: string | null;
  score: {
    id: string;
    score: string;
    max_score: string;
    criteria_breakdown: Record<string, unknown> | null;
    review_notes: string | null;
    reviewer: string | null;
    reviewed_at: string | null;
  } | null;
}

export interface AdminAssessment {
  id: string;
  candidate_pipeline_entry_id: string;
  type: string;
  title: string;
  instructions: string | null;
  time_limit_minutes: number | null;
  starts_at: string | null;
  closes_at: string | null;
  attempt_limit: number | null;
  scoring_rules: Record<string, unknown> | null;
  status: string;
  status_label: string;
  result_visible_to_candidate: boolean;
  assigned_by: string | null;
  reviewer: string | null;
  submissions: AssessmentSubmissionView[];
  created_at: string | null;
}

export function listAssessments(assignmentId: string, entryId: string): Promise<{ data: AdminAssessment[] }> {
  return bff(`/cms/recruitment-assignments/${assignmentId}/pipeline/${entryId}/assessments`);
}

export function createAssessment(
  assignmentId: string,
  entryId: string,
  payload: { type: string; title: string; instructions?: string; time_limit_minutes?: number; attempt_limit?: number; result_visible_to_candidate?: boolean },
): Promise<{ data: AdminAssessment }> {
  return bff(`/cms/recruitment-assignments/${assignmentId}/pipeline/${entryId}/assessments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function scoreAssessmentSubmission(
  assignmentId: string,
  entryId: string,
  assessmentId: string,
  submissionId: string,
  payload: { score: number; max_score: number; review_notes?: string },
): Promise<{ data: AdminAssessment }> {
  return bff(
    `/cms/recruitment-assignments/${assignmentId}/pipeline/${entryId}/assessments/${assessmentId}/submissions/${submissionId}/score`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export interface AdminInterview {
  id: string;
  candidate_pipeline_entry_id: string;
  type: string;
  scheduled_at: string | null;
  timezone: string | null;
  location_or_link: string | null;
  status: string;
  status_label: string;
  candidate_confirmed_at: string | null;
  created_by: string | null;
  panel_members: { id: string; panelist_type: string; panelist_name: string | null; role: string | null }[];
  scorecards: {
    id: string;
    panelist_type: string;
    panelist_name: string | null;
    competency_scores: Record<string, unknown> | null;
    panel_comments: string | null;
    overall_recommendation: string | null;
    conflict_of_interest: boolean;
    submitted_at: string | null;
  }[];
  created_at: string | null;
}

export function listInterviews(assignmentId: string, entryId: string): Promise<{ data: AdminInterview[] }> {
  return bff(`/cms/recruitment-assignments/${assignmentId}/pipeline/${entryId}/interviews`);
}

export function createInterview(
  assignmentId: string,
  entryId: string,
  payload: { type: string; scheduled_at?: string; timezone?: string; location_or_link?: string },
): Promise<{ data: AdminInterview }> {
  return bff(`/cms/recruitment-assignments/${assignmentId}/pipeline/${entryId}/interviews`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateInterviewStatus(
  assignmentId: string,
  entryId: string,
  interviewId: string,
  status: "confirmed" | "completed" | "cancelled" | "no_show" | "rescheduled",
): Promise<{ data: AdminInterview }> {
  return bff(`/cms/recruitment-assignments/${assignmentId}/pipeline/${entryId}/interviews/${interviewId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function addInterviewPanelMember(
  assignmentId: string,
  entryId: string,
  interviewId: string,
  payload: { panelist_type: "user" | "organisation_user"; panelist_id: number; role?: string },
): Promise<{ data: { id: string } }> {
  return bff(`/cms/recruitment-assignments/${assignmentId}/pipeline/${entryId}/interviews/${interviewId}/panel-members`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function submitInterviewScorecard(
  assignmentId: string,
  entryId: string,
  interviewId: string,
  payload: { overall_recommendation: string; panel_comments?: string; conflict_of_interest?: boolean },
): Promise<{ data: { id: string } }> {
  return bff(`/cms/recruitment-assignments/${assignmentId}/pipeline/${entryId}/interviews/${interviewId}/scorecard`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface AdminReferenceCheck {
  id: string;
  candidate_pipeline_entry_id: string;
  referee_name: string;
  referee_relationship: string | null;
  referee_organisation: string | null;
  contact_method: string | null;
  referee_contact: string | null;
  candidate_consented_at: string | null;
  consent_text_version: string | null;
  status: string;
  status_label: string;
  requested_by: string | null;
  date_contacted: string | null;
  response_status: string | null;
  verification_notes: string | null;
  risk_flags: string | null;
  final_outcome: string | null;
  created_at: string | null;
}

export function listReferenceChecks(assignmentId: string, entryId: string): Promise<{ data: AdminReferenceCheck[] }> {
  return bff(`/cms/recruitment-assignments/${assignmentId}/pipeline/${entryId}/reference-checks`);
}

export function createReferenceCheck(
  assignmentId: string,
  entryId: string,
  payload: {
    referee_name: string;
    referee_relationship?: string;
    referee_organisation?: string;
    contact_method?: string;
    referee_contact?: string;
    candidate_consented: true;
    consent_text_version: string;
  },
): Promise<{ data: AdminReferenceCheck }> {
  return bff(`/cms/recruitment-assignments/${assignmentId}/pipeline/${entryId}/reference-checks`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateReferenceCheck(
  assignmentId: string,
  entryId: string,
  referenceCheckId: string,
  payload: { status?: string; date_contacted?: string; response_status?: string; verification_notes?: string; risk_flags?: string; final_outcome?: string },
): Promise<{ data: AdminReferenceCheck }> {
  return bff(`/cms/recruitment-assignments/${assignmentId}/pipeline/${entryId}/reference-checks/${referenceCheckId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// ─── Verification cases (Phase 3 additions) ────────────────────────────────

export function createVerificationCase(payload: {
  expert_pool_profile_id: number;
  candidate_pipeline_entry_id?: string;
  target_level?: string;
}): Promise<AdminSingleResponse<VerificationCase>> {
  return bff("/cms/verification-cases", { method: "POST", body: JSON.stringify(payload) });
}

export function addVerificationCheck(
  caseId: string,
  payload: { check_type: string; subject?: string },
): Promise<AdminSingleResponse<VerificationCase>> {
  return bff(`/cms/verification-cases/${caseId}/checks`, { method: "POST", body: JSON.stringify(payload) });
}

// ─── Recruiter Search (Phase 1 — foundation) ──────────────────────────
//
// RS-Recruiter-only professional discovery. Returns the allowlist-shaped
// ExpertSearchResult, never the full Expert Pool profile.

export interface ExpertSearchResult {
  id: number;
  professional_title: string | null;
  years_experience: number | null;
  country: string | null;
  state: string | null;
  disciplines: string[];
  languages: string[] | null;
  verification_level: string | null;
  verification_level_label: string | null;
  visibility_status: string | null;
  expert_pool_status: string | null;
}

export function searchRecruiterDatabase(
  params: { page?: number; discipline?: string; country?: string; min_experience?: string; verification_level?: string } = {},
): Promise<AdminPaginatedResponse<ExpertSearchResult>> {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  ).toString();
  return bff(`/cms/recruiter-search${qs ? `?${qs}` : ""}`);
}

// ─── Verification (Phase 1 — foundation) ──────────────────────────────

export interface VerificationCheck {
  id: string;
  check_type: string;
  subject: string | null;
  status: string;
  verifier: string | null;
  started_at: string | null;
  completed_at: string | null;
  evidence_reviewed: string | null;
  method_used: string | null;
  internal_notes: string | null;
  expires_at: string | null;
  rejection_reason: string | null;
}

export interface VerificationCase {
  id: string;
  expert_pool_profile_id: number;
  candidate_pipeline_entry_id: string | null;
  expert_name: string | null;
  target_level: string | null;
  status: string;
  opened_at: string | null;
  closed_at: string | null;
  checks: VerificationCheck[];
}

export function listVerificationCases(
  params: { page?: number; status?: string } = {},
): Promise<AdminPaginatedResponse<VerificationCase>> {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  ).toString();
  return bff(`/cms/verification-cases${qs ? `?${qs}` : ""}`);
}

export function updateVerificationCheck(
  caseId: string,
  checkId: string,
  payload: { status: string; internal_notes?: string; rejection_reason?: string },
): Promise<AdminSingleResponse<VerificationCase>> {
  return bff(`/cms/verification-cases/${caseId}/checks/${checkId}`, { method: "PATCH", body: JSON.stringify(payload) });
}

// ─── Audit Log ─────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: number;
  actorType: string | null;
  actorName: string | null;
  action: string;
  subjectType: string | null;
  subjectId: number | null;
  subjectLabel: string | null;
  changes: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

export function listAuditLog(
  params: { page?: number; action?: string; subject_type?: string } = {},
): Promise<AdminPaginatedResponse<AuditLogEntry>> {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  ).toString();
  return bff(`/cms/audit-log${qs ? `?${qs}` : ""}`);
}

// ─── Submissions (Api\Admin\AdminSubmissionsController) ─────────────────
//
// Unlike the CMS/media/audit-log envelope above, this controller returns
// Laravel's raw paginate() JSON shape directly (data/current_page/
// last_page/total all at the top level, not nested under `meta`) — kept
// as its own type rather than force-fitting AdminPaginatedResponse.

export interface LaravelPaginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

export type SubmissionKind =
  | "contact-submissions"
  | "consultation-bookings"
  | "newsletter-subscribers"
  | "job-applications";

export function listSubmissions<T>(
  kind: SubmissionKind,
  params: Record<string, string> = {},
): Promise<LaravelPaginated<T>> {
  const qs = new URLSearchParams(params).toString();
  return bff(`/cms/${kind}${qs ? `?${qs}` : ""}`);
}

export function updateSubmission<T>(
  kind: Exclude<SubmissionKind, "newsletter-subscribers">,
  id: number,
  data: { status?: string; internal_notes?: string },
): Promise<T> {
  return bff(`/cms/${kind}/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

// ─── Assessment file download URL (Phase 4) ───────────────────────────────────
//
// A GET to this path streams the file directly — never call it through
// the `bff()` JSON helper. Used as an <a href> / window.open target.

export function assessmentFileDownloadUrl(assignmentId: string, entryId: string, assessmentId: string, submissionId: string): string {
  return `/api/admin/recruitment-assignments/${assignmentId}/pipeline/${entryId}/assessments/${assessmentId}/submissions/${submissionId}/file`;
}

// ─── Placement & Assignment Feedback (Phase 4) ─────────────────────────────────

export interface AdminPlacement {
  id: string;
  candidate_pipeline_entry_id: string;
  engagement_type: string | null;
  start_date: string | null;
  end_date: string | null;
  deployment_location: string | null;
  deployment_notes: string | null;
  onboarding_notes: string | null;
  status: "pending_confirmation" | "confirmed" | "cancelled";
  status_label: string;
  organisation_confirmed_at: string | null;
  organisation_confirmed_by: string | null;
  professional_confirmed_at: string | null;
  professional_confirmed_by: string | null;
  created_by: string | null;
  created_at: string | null;
}

export function getPlacement(assignmentId: string, entryId: string): Promise<AdminSingleResponse<AdminPlacement>> {
  return bff(`/cms/recruitment-assignments/${assignmentId}/pipeline/${entryId}/placement`);
}

export function createPlacement(
  assignmentId: string,
  entryId: string,
  payload: {
    engagement_type?: string;
    start_date?: string;
    end_date?: string;
    deployment_location?: string;
    deployment_notes?: string;
    onboarding_notes?: string;
  },
): Promise<AdminSingleResponse<AdminPlacement>> {
  return bff(`/cms/recruitment-assignments/${assignmentId}/pipeline/${entryId}/placement`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function cancelPlacement(assignmentId: string, entryId: string): Promise<AdminSingleResponse<AdminPlacement>> {
  return bff(`/cms/recruitment-assignments/${assignmentId}/pipeline/${entryId}/placement/cancel`, { method: "PATCH" });
}

export interface AdminAssignmentFeedback {
  id: string;
  placement_id: string;
  submitter_type: string;
  submitter_name: string | null;
  rating: number | null;
  comments: string | null;
  submitted_at: string | null;
}

export function listAssignmentFeedback(assignmentId: string, entryId: string): Promise<{ data: AdminAssignmentFeedback[] }> {
  return bff(`/cms/recruitment-assignments/${assignmentId}/pipeline/${entryId}/feedback`);
}
