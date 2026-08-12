"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { submitContactForm } from "@/lib/api/forms";
import { contactFormSchema, type ContactFormValues } from "@/lib/validations/forms";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const ENQUIRY_TYPES = [
  { label: "General Enquiry", value: "general" },
  { label: "Project Proposal", value: "proposal" },
  { label: "Strategic Partnership", value: "partnership" },
  { label: "Product Enquiry", value: "product" },
  { label: "Capacity Development / Training", value: "training" },
] as const;

export function ContactForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      type: "general",
      full_name: "",
      email: "",
      phone: "",
      organization: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setServerError(null);
    setSuccessMessage(null);

    try {
      const response = await submitContactForm(data);
      setSuccessMessage(response.message);
      reset();
    } catch (err: unknown) {
      setServerError((err as Error).message || "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <p className="text-h4 text-foreground">Send us a message</p>
      <p className="text-small text-muted-foreground mt-2">
        Fill out the form below to get in touch with our team regarding your research, technology, or capacity development needs.
      </p>

      {successMessage && (
        <div className="bg-success/10 border-success/30 text-success mt-6 flex items-start gap-3 rounded-lg border p-4 text-sm">
          <CheckCircle2 className="size-5 shrink-0" />
          <div>
            <p className="font-semibold">Message Sent!</p>
            <p className="mt-1">{successMessage}</p>
          </div>
        </div>
      )}

      {serverError && (
        <div className="bg-danger/10 border-danger/30 text-danger mt-6 flex items-start gap-3 rounded-lg border p-4 text-sm">
          <AlertCircle className="size-5 shrink-0" />
          <div>
            <p className="font-semibold">Submission Failed</p>
            <p className="mt-1">{serverError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-6" noValidate>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            htmlFor="contact-name"
            label="Full Name"
            required
            error={errors.full_name?.message}
          >
            <Input
              id="contact-name"
              {...register("full_name")}
              autoComplete="name"
              placeholder="e.g. Dr. Jane Doe"
            />
          </FormField>

          <FormField
            htmlFor="contact-email"
            label="Email Address"
            required
            error={errors.email?.message}
          >
            <Input
              id="contact-email"
              type="email"
              {...register("email")}
              autoComplete="email"
              placeholder="jane@organization.org"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            htmlFor="contact-organization"
            label="Organization"
            error={errors.organization?.message}
          >
            <Input
              id="contact-organization"
              {...register("organization")}
              placeholder="e.g. World Bank / University"
            />
          </FormField>

          <FormField
            htmlFor="contact-phone"
            label="Phone Number"
            error={errors.phone?.message}
          >
            <Input
              id="contact-phone"
              type="tel"
              {...register("phone")}
              placeholder="+234 800 000 0000"
            />
          </FormField>
        </div>

        <FormField
          htmlFor="contact-type"
          label="Enquiry Type"
          required
          error={errors.type?.message}
        >
          <Select id="contact-type" {...register("type")}>
            {ENQUIRY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          htmlFor="contact-message"
          label="Message"
          required
          error={errors.message?.message}
        >
          <Textarea
            id="contact-message"
            {...register("message")}
            rows={5}
            placeholder="Tell us about your project requirements, scope, or questions..."
          />
        </FormField>

        <Button type="submit" disabled={isSubmitting} size="lg" className="self-start">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Message"
          )}
        </Button>
      </form>
    </Card>
  );
}
