import { z } from "zod";

export const contactFormSchema = z.object({
  type: z.enum(["general", "proposal", "partnership", "product", "training"], {
    message: "Please select an enquiry type.",
  }),
  full_name: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().optional(),
  organization: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters."),
  related_product_id: z.number().optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export type NewsletterFormValues = z.infer<typeof newsletterSchema>;

export const consultationBookingSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().optional(),
  organization: z.string().optional(),
  related_solution_id: z.number().optional(),
  preferred_date: z.string().optional(),
  preferred_time: z.string().optional(),
  message: z.string().optional(),
});

export type ConsultationBookingValues = z.infer<typeof consultationBookingSchema>;

export const jobApplicationSchema = z.object({
  vacancy_id: z.number().nullable().optional(),
  applicant_name: z.string().min(2, "Applicant name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().optional(),
  portfolio_url: z
    .string()
    .url("Please enter a valid URL.")
    .or(z.literal(""))
    .optional(),
  cover_letter: z.string().optional(),
});

export type JobApplicationValues = z.infer<typeof jobApplicationSchema>;
