/**
 * Organisation — BFF API client
 *
 * All functions call the Next.js BFF Route Handlers under /api/organisation/,
 * which forward to Laravel and manage the secure httpOnly session cookie.
 * Nothing in this file calls Laravel directly. Mirrors expert-pool.ts.
 */

import type {
  CandidateEvaluation,
  Organisation,
  OrganisationAssignmentFeedback,
  OrganisationInterview,
  OrganisationLoginResponse,
  OrganisationPlacement,
  OrganisationUser,
  PaginatedMeta,
  ReleasedCandidate,
  ReleasedCandidateComment,
  TalentRequest,
  TalentRequestPayload,
} from "@/types/organisation";

export class OrganisationApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "OrganisationApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function bff<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/organisation${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init.headers,
    },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new OrganisationApiError(
      json.message ?? `Request failed (${res.status})`,
      res.status,
      json.errors,
    );
  }

  return json as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function register(data: {
  organisation_name: string;
  legal_name?: string;
  organisation_type?: string;
  sector?: string;
  country?: string;
  state?: string;
  registered_address?: string;
  website?: string;
  registration_number?: string;
  profile_description?: string;
  recruitment_needs?: string;
  terms_agreed: boolean;
  contact_name: string;
  contact_position?: string;
  contact_phone?: string;
  email: string;
  password: string;
  password_confirmation: string;
}) {
  return bff<{ message: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function login(data: { email: string; password: string }): Promise<OrganisationLoginResponse> {
  return bff<OrganisationLoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function logout() {
  return bff<{ message: string }>("/auth/logout", { method: "POST" });
}

export function getMe(): Promise<{ user: OrganisationUser }> {
  return bff<{ user: OrganisationUser }>("/auth/me");
}

export function resendVerification(email: string) {
  return bff<{ message: string }>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function verifyEmail(params: Record<string, string>) {
  return bff<{ message: string }>("/auth/verify-email?" + new URLSearchParams(params).toString());
}

export function forgotPassword(email: string) {
  return bff<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(data: { token: string; email: string; password: string; password_confirmation: string }) {
  return bff<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function changePassword(data: { current_password: string; password: string; password_confirmation: string }) {
  return bff<{ message: string }>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export function getProfile(): Promise<{ data: Organisation }> {
  return bff<{ data: Organisation }>("/profile");
}

export function updateProfile(data: Partial<Organisation>): Promise<{ data: Organisation }> {
  return bff<{ data: Organisation }>("/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ─── Team members ───────────────────────────────────────────────────────────

export function getUsers(): Promise<{ data: OrganisationUser[]; meta: PaginatedMeta }> {
  return bff("/users");
}

export function addUser(data: { name: string; email: string; password: string; password_confirmation: string }) {
  return bff<{ data: OrganisationUser }>("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function removeUser(id: number) {
  return bff<{ message: string }>(`/users/${id}`, { method: "DELETE" });
}

// ─── Talent requests ─────────────────────────────────────────────────────────

export function getTalentRequests(): Promise<{ data: TalentRequest[]; meta: PaginatedMeta }> {
  return bff("/talent-requests");
}

export function createTalentRequest(data: TalentRequestPayload): Promise<{ data: TalentRequest }> {
  return bff<{ data: TalentRequest }>("/talent-requests", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getTalentRequest(id: string): Promise<{ data: TalentRequest }> {
  return bff<{ data: TalentRequest }>(`/talent-requests/${id}`);
}

// ─── Released Candidates (Phase 2 — Controlled Data Release) ──────────────────

export function getReleasedCandidates(): Promise<{ data: ReleasedCandidate[]; meta: PaginatedMeta }> {
  return bff("/released-candidates");
}

export function getReleasedCandidate(id: string): Promise<{ data: ReleasedCandidate }> {
  return bff<{ data: ReleasedCandidate }>(`/released-candidates/${id}`);
}

export function updateReleasedCandidateStatus(
  id: string,
  organisationStatus: "interested" | "not_interested" | "pending",
): Promise<{ data: ReleasedCandidate }> {
  return bff<{ data: ReleasedCandidate }>(`/released-candidates/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ organisation_status: organisationStatus }),
  });
}

export function addReleasedCandidateComment(id: string, comment: string): Promise<{ data: ReleasedCandidateComment }> {
  return bff<{ data: ReleasedCandidateComment }>(`/released-candidates/${id}/comments`, {
    method: "POST",
    body: JSON.stringify({ comment }),
  });
}

// ─── Candidate Evaluation (Phase 3) ────────────────────────────────────────────

export function getCandidateEvaluations(releaseId: string): Promise<{ data: CandidateEvaluation[] }> {
  return bff(`/released-candidates/${releaseId}/evaluations`);
}

export function createCandidateEvaluation(
  releaseId: string,
  payload: { score?: number; criteria_notes?: string; recommendation?: string; final_outcome?: string },
): Promise<{ data: CandidateEvaluation }> {
  return bff(`/released-candidates/${releaseId}/evaluations`, { method: "POST", body: JSON.stringify(payload) });
}

export function updateCandidateEvaluation(
  releaseId: string,
  evaluationId: string,
  payload: { score?: number; criteria_notes?: string; recommendation?: string; final_outcome?: string },
): Promise<{ data: CandidateEvaluation }> {
  return bff(`/released-candidates/${releaseId}/evaluations/${evaluationId}`, { method: "PATCH", body: JSON.stringify(payload) });
}

// ─── Interviews (Phase 3) ───────────────────────────────────────────────────────

export function getOrganisationInterviews(): Promise<{ data: OrganisationInterview[] }> {
  return bff("/interviews");
}

export function getOrganisationInterview(id: string): Promise<{ data: OrganisationInterview }> {
  return bff(`/interviews/${id}`);
}

export function submitOrganisationScorecard(
  id: string,
  payload: { overall_recommendation: string; panel_comments?: string; competency_scores?: Record<string, unknown> },
): Promise<{ data: { id: string } }> {
  return bff(`/interviews/${id}/scorecard`, { method: "POST", body: JSON.stringify(payload) });
}

// ─── Placements & Feedback (Phase 4) ───────────────────────────────────────────

export function getOrganisationPlacements(): Promise<{ data: OrganisationPlacement[] }> {
  return bff("/placements");
}

export function getOrganisationPlacement(id: string): Promise<{ data: OrganisationPlacement }> {
  return bff(`/placements/${id}`);
}

export function confirmOrganisationPlacement(id: string): Promise<{ data: OrganisationPlacement }> {
  return bff(`/placements/${id}/confirm`, { method: "POST" });
}

export function getOrganisationFeedback(placementId: string): Promise<{ data: OrganisationAssignmentFeedback[] }> {
  return bff(`/placements/${placementId}/feedback`);
}

export function submitOrganisationFeedback(
  placementId: string,
  payload: { rating?: number; comments?: string },
): Promise<{ data: OrganisationAssignmentFeedback }> {
  return bff(`/placements/${placementId}/feedback`, { method: "POST", body: JSON.stringify(payload) });
}

// ─── MFA ──────────────────────────────────────────────────────────────────────

export function mfaSetup(): Promise<{ secret: string; qr_url: string }> {
  return bff<{ secret: string; qr_url: string }>("/mfa/setup");
}

export function mfaConfirm(code: string): Promise<{ message: string; recovery_codes: string[] }> {
  return bff<{ message: string; recovery_codes: string[] }>("/mfa/confirm", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export function mfaVerify(data: {
  code: string;
  recovery_mode?: boolean;
  mfa_token: string;
}): Promise<{ token: string; user: OrganisationUser }> {
  const { mfa_token, ...body } = data;
  return bff("/mfa/verify", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "X-MFA-Token": mfa_token },
  });
}

export function mfaDisable(password: string): Promise<{ message: string }> {
  return bff<{ message: string }>("/mfa/disable", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export function getRecoveryCodes(): Promise<{ unused_recovery_codes: number }> {
  return bff<{ unused_recovery_codes: number }>("/mfa/recovery-codes");
}

export function regenerateRecoveryCodes(password: string): Promise<{ message: string; recovery_codes: string[] }> {
  return bff<{ message: string; recovery_codes: string[] }>("/mfa/recovery-codes/regenerate", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}
