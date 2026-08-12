"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { FileInput } from "@/components/ui/FileInput";
import { submitJobApplication } from "@/lib/api/forms";
import { jobApplicationSchema, type JobApplicationValues } from "@/lib/validations/forms";
import { X, CheckCircle2, AlertCircle, Loader2, Briefcase } from "lucide-react";

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacancyId?: number;
  vacancyTitle?: string;
}

export function JobApplicationModal({
  isOpen,
  onClose,
  vacancyId,
  vacancyTitle,
}: JobApplicationModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<JobApplicationValues>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: {
      vacancy_id: vacancyId ?? null,
      applicant_name: "",
      email: "",
      phone: "",
      portfolio_url: "",
      cover_letter: "",
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: JobApplicationValues) => {
    setServerError(null);
    setSuccessMessage(null);
    setCvError(null);

    if (!cvFile) {
      setCvError("Please upload your CV/Resume file (PDF, DOC, DOCX up to 10MB).");
      return;
    }

    const formData = new FormData();
    if (vacancyId) {
      formData.append("vacancy_id", String(vacancyId));
    }
    formData.append("applicant_name", data.applicant_name);
    formData.append("email", data.email);
    if (data.phone) formData.append("phone", data.phone);
    if (data.portfolio_url) formData.append("portfolio_url", data.portfolio_url);
    if (data.cover_letter) formData.append("cover_letter", data.cover_letter);
    formData.append("cv_file", cvFile);

    try {
      const response = await submitJobApplication(formData);
      setSuccessMessage(response.message);
      reset();
      setCvFile(null);
    } catch (err: unknown) {
      setServerError((err as Error).message || "Failed to submit application. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-card text-card-foreground border-border relative w-full max-w-lg rounded-xl border p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground absolute right-4 top-4 rounded-lg p-1 transition-colors"
          aria-label="Close dialog"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-2">
          <Briefcase className="text-primary size-5" />
          <h2 className="text-h3 font-bold">
            {vacancyTitle ? `Apply for ${vacancyTitle}` : "Speculative Application"}
          </h2>
        </div>
        <p className="text-small text-muted-foreground mt-1">
          {vacancyTitle
            ? "Submit your application and CV for this role."
            : "No active vacancy matching your profile? Send us your CV for future opportunities."}
        </p>

        {successMessage ? (
          <div className="my-6">
            <div className="bg-success/10 border-success/30 text-success flex items-start gap-3 rounded-lg border p-4 text-sm">
              <CheckCircle2 className="size-5 shrink-0" />
              <div>
                <p className="font-semibold">Application Submitted!</p>
                <p className="mt-1">{successMessage}</p>
              </div>
            </div>
            <Button onClick={onClose} className="mt-6 w-full">
              Close Window
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
            {serverError && (
              <div className="bg-danger/10 border-danger/30 text-danger flex items-start gap-3 rounded-lg border p-3 text-sm">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <p>{serverError}</p>
              </div>
            )}

            <FormField
              htmlFor="app-name"
              label="Full Name"
              required
              error={errors.applicant_name?.message}
            >
              <Input id="app-name" {...register("applicant_name")} placeholder="Jane Doe" />
            </FormField>

            <FormField
              htmlFor="app-email"
              label="Email Address"
              required
              error={errors.email?.message}
            >
              <Input
                id="app-email"
                type="email"
                {...register("email")}
                placeholder="jane@example.com"
              />
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField htmlFor="app-phone" label="Phone Number" error={errors.phone?.message}>
                <Input id="app-phone" type="tel" {...register("phone")} placeholder="+234..." />
              </FormField>

              <FormField htmlFor="app-portfolio" label="Portfolio / LinkedIn URL" error={errors.portfolio_url?.message}>
                <Input id="app-portfolio" type="url" {...register("portfolio_url")} placeholder="https://..." />
              </FormField>
            </div>

            <FormField
              htmlFor="app-cv"
              label="Upload CV / Resume (PDF, DOC, DOCX up to 10MB)"
              required
              error={cvError || undefined}
            >
              <FileInput
                id="app-cv"
                accept=".pdf,.doc,.docx"
                label="Click or drag CV / Resume here"
                description="PDF, DOC or DOCX · Max 10 MB"
                fileName={cvFile?.name}
                onClear={() => {
                  setCvFile(null);
                  setCvError(null);
                }}
                invalid={!!cvError}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 10 * 1024 * 1024) {
                      setCvError("File size exceeds 10MB limit.");
                      return;
                    }
                    setCvFile(file);
                    setCvError(null);
                  }
                }}
              />
            </FormField>

            <FormField htmlFor="app-cover-letter" label="Cover Letter / Summary">
              <Textarea
                id="app-cover-letter"
                {...register("cover_letter")}
                rows={4}
                placeholder="Why are you interested in working with Result Seekers? Highlight relevant experience..."
              />
            </FormField>

            <div className="mt-2 flex items-center justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
