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
