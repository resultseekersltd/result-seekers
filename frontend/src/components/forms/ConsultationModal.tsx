"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { bookConsultation } from "@/lib/api/forms";
import { consultationBookingSchema, type ConsultationBookingValues } from "@/lib/validations/forms";
import { X, CheckCircle2, AlertCircle, Loader2, Calendar } from "lucide-react";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  solutionId?: number;
  solutionName?: string;
}

export function ConsultationModal({
  isOpen,
  onClose,
  solutionId,
  solutionName,
}: ConsultationModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConsultationBookingValues>({
    resolver: zodResolver(consultationBookingSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      organization: "",
      related_solution_id: solutionId,
      preferred_date: "",
      preferred_time: "Morning (9am - 12pm)",
      message: "",
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: ConsultationBookingValues) => {
    setServerError(null);
    setSuccessMessage(null);

    try {
      const response = await bookConsultation({
        ...data,
        related_solution_id: solutionId ?? data.related_solution_id,
      });
      setSuccessMessage(response.message);
      reset();
    } catch (err: unknown) {
      setServerError((err as Error).message || "Failed to submit booking. Please try again.");
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
          <Calendar className="text-primary size-5" />
          <h2 className="text-h3 font-bold">Book a Consultation</h2>
        </div>
        <p className="text-small text-muted-foreground mt-1">
          {solutionName
            ? `Schedule a discussion with our experts regarding ${solutionName}.`
            : "Schedule a discussion with our technical and research leadership team."}
        </p>

        {successMessage ? (
          <div className="my-6">
            <div className="bg-success/10 border-success/30 text-success flex items-start gap-3 rounded-lg border p-4 text-sm">
              <CheckCircle2 className="size-5 shrink-0" />
              <div>
                <p className="font-semibold">Booking Requested!</p>
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
              htmlFor="consult-name"
              label="Full Name"
              required
              error={errors.full_name?.message}
            >
              <Input id="consult-name" {...register("full_name")} placeholder="Dr. Jane Doe" />
            </FormField>

            <FormField
              htmlFor="consult-email"
              label="Email Address"
              required
              error={errors.email?.message}
            >
              <Input
                id="consult-email"
                type="email"
                {...register("email")}
                placeholder="jane@organization.org"
              />
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField htmlFor="consult-organization" label="Organization">
                <Input id="consult-organization" {...register("organization")} placeholder="Org Name" />
              </FormField>

              <FormField htmlFor="consult-phone" label="Phone">
                <Input id="consult-phone" type="tel" {...register("phone")} placeholder="+234..." />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField htmlFor="consult-date" label="Preferred Date">
                <Input id="consult-date" type="date" {...register("preferred_date")} />
              </FormField>

              <FormField htmlFor="consult-time" label="Preferred Time">
                <Input id="consult-time" {...register("preferred_time")} placeholder="e.g. Morning" />
              </FormField>
            </div>

            <FormField htmlFor="consult-message" label="Notes / Key Discussion Points">
              <Textarea
                id="consult-message"
                {...register("message")}
                rows={3}
                placeholder="Brief summary of what you'd like to discuss..."
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
                    Submitting...
                  </>
                ) : (
                  "Request Consultation"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
