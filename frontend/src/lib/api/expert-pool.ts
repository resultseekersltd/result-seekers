/**
 * Expert Pool — BFF API client
 *
 * All functions call the Next.js BFF Route Handlers under /api/expert-pool/,
 * which forward to Laravel and manage the secure httpOnly session cookie.
 * Nothing in this file calls Laravel directly.
 */

import type {
  AuthResponse,
  ExpertDiscipline,
  ExpertEducation,
  ExpertExperience,
  ExpertProfile,
  ExpertUser,
  LoginResponse,
  EducationPayload,
  ExperiencePayload,
  ProfileUpdatePayload,
} from "@/types/expert-pool";

// ─── Error ────────────────────────────────────────────────────────────────────

export class ExpertApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ExpertApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function bff<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/expert-pool${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init.headers,
    },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ExpertApiError(
      json.message ?? `Request failed (${res.status})`,
      res.status,
      json.errors,
    );
  }

  return json as T;
}

async function bffForm<T>(path: string, body: FormData): Promise<T> {
  const res = await fetch(`/api/expert-pool${path}`, {
    method: "POST",
    body,
    headers: { Accept: "application/json" },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ExpertApiError(
      json.message ?? `Request failed (${res.status})`,
      res.status,
      json.errors,
    );
  }

  return json as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function register(data: { name: string; email: string; password: string; password_confirmation: string }) {
  return bff<{ message: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function login(data: { email: string; password: string }): Promise<LoginResponse> {
  return bff<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function logout() {
  return bff<{ message: string }>("/auth/logout", { method: "POST" });
}

export function getMe(): Promise<{ user: ExpertUser }> {
  return bff<{ user: ExpertUser }>("/auth/me");
}

export function sendVerification(email: string) {
  return bff<{ message: string }>("/auth/send-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function verifyEmail(params: Record<string, string>) {
  return bff<{ message: string }>("/auth/verify-email?" + new URLSearchParams(params).toString(), {
    method: "GET",
  });
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

// ─── Profile ──────────────────────────────────────────────────────────────────

export function getProfile(): Promise<{ data: ExpertProfile }> {
  return bff<{ data: ExpertProfile }>("/profile");
}

export function updateProfile(data: ProfileUpdatePayload): Promise<{ data: ExpertProfile }> {
  return bff<{ data: ExpertProfile }>("/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function submitProfile(): Promise<{ message: string }> {
  return bff<{ message: string }>("/profile/submit", { method: "POST" });
}

export function changePassword(data: { current_password: string; password: string; password_confirmation: string }) {
  return bff<{ message: string }>("/profile/change-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── Disciplines ─────────────────────────────────────────────────────────────

export function getDisciplines(): Promise<{ data: ExpertDiscipline[] }> {
  return bff<{ data: ExpertDiscipline[] }>("/disciplines");
}

// ─── Experience ───────────────────────────────────────────────────────────────

export function getExperiences(): Promise<{ data: ExpertExperience[] }> {
  return bff<{ data: ExpertExperience[] }>("/experiences");
}

export function addExperience(data: ExperiencePayload): Promise<{ data: ExpertExperience }> {
  return bff<{ data: ExpertExperience }>("/experiences", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateExperience(id: number, data: Partial<ExperiencePayload>): Promise<{ data: ExpertExperience }> {
  return bff<{ data: ExpertExperience }>(`/experiences/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteExperience(id: number): Promise<{ message: string }> {
  return bff<{ message: string }>(`/experiences/${id}`, { method: "DELETE" });
}

// ─── Education ────────────────────────────────────────────────────────────────

export function getEducation(): Promise<{ data: ExpertEducation[] }> {
  return bff<{ data: ExpertEducation[] }>("/education");
}

export function addEducation(data: EducationPayload): Promise<{ data: ExpertEducation }> {
  return bff<{ data: ExpertEducation }>("/education", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateEducation(id: number, data: Partial<EducationPayload>): Promise<{ data: ExpertEducation }> {
  return bff<{ data: ExpertEducation }>(`/education/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteEducation(id: number): Promise<{ message: string }> {
  return bff<{ message: string }>(`/education/${id}`, { method: "DELETE" });
}

// ─── CV ───────────────────────────────────────────────────────────────────────

export function uploadCv(file: File): Promise<{ message: string; cv_original_name: string; cv_uploaded_at: string }> {
  const form = new FormData();
  form.append("cv", file);
  return bffForm("/cv", form);
}

export async function downloadCv(): Promise<Blob> {
  const res = await fetch("/api/expert-pool/cv/download", {
    headers: { Accept: "*/*" },
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new ExpertApiError(json.message ?? "Download failed", res.status);
  }
  return res.blob();
}

export function deleteCv(): Promise<{ message: string }> {
  return bff<{ message: string }>("/cv", { method: "DELETE" });
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

export function mfaVerify(data: { code: string; recovery_mode?: boolean; mfa_token: string }): Promise<AuthResponse> {
  const { mfa_token, ...body } = data;
  return bff<AuthResponse>("/mfa/verify", {
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
