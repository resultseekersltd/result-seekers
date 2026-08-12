import { apiFetch } from "@/lib/api/client";

export interface ContactSubmissionPayload {
  type: "general" | "proposal" | "partnership" | "product" | "training";
  full_name: string;
  email: string;
  phone?: string;
  organization?: string;
  message: string;
  related_product_id?: number;
}

export interface ConsultationBookingPayload {
  full_name: string;
  email: string;
  phone?: string;
  organization?: string;
  related_solution_id?: number;
  preferred_date?: string;
  preferred_time?: string;
  message?: string;
}

export interface FormSubmissionResponse {
  message: string;
  id?: number;
}

/**
 * Submits a contact enquiry to Laravel API: POST /api/contact-submissions
 */
export async function submitContactForm(
  data: ContactSubmissionPayload
): Promise<FormSubmissionResponse> {
  return await apiFetch<FormSubmissionResponse>("/contact-submissions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });
}

/**
 * Submits a newsletter subscription to Laravel API: POST /api/newsletter-subscribers
 */
export async function subscribeNewsletter(
  email: string
): Promise<FormSubmissionResponse> {
  return await apiFetch<FormSubmissionResponse>("/newsletter-subscribers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email }),
  });
}

/**
 * Submits a consultation booking request to Laravel API: POST /api/consultation-bookings
 */
export async function bookConsultation(
  data: ConsultationBookingPayload
): Promise<FormSubmissionResponse> {
  return await apiFetch<FormSubmissionResponse>("/consultation-bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });
}

/**
 * Submits a job application (with multipart file upload) to Laravel API: POST /api/job-applications
 */
export async function submitJobApplication(
  formData: FormData
): Promise<FormSubmissionResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const res = await fetch(`${baseUrl}/job-applications`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || "Failed to submit job application.");
  }

  return await res.json();
}
