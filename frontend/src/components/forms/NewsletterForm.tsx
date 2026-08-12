"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { subscribeNewsletter } from "@/lib/api/forms";
import { newsletterSchema, type NewsletterFormValues } from "@/lib/validations/forms";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function NewsletterForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: NewsletterFormValues) => {
    setServerError(null);
    setSuccessMessage(null);

    try {
      const response = await subscribeNewsletter(data.email);
      setSuccessMessage(response.message);
      reset();
    } catch (err: unknown) {
      setServerError((err as Error).message || "Subscription failed. Please try again.");
    }
  };

  return (
    <div className="border-border mt-12 border-t pt-8">
      <h3 className="text-h4 text-foreground">Stay informed</h3>
      <p className="text-small text-muted-foreground mt-2">
        Subscribe for evidence-backed insights, publications, and updates from Result Seekers.
      </p>

      {successMessage && (
        <div className="bg-success/10 border-success/30 text-success mt-4 flex max-w-md items-center gap-2 rounded-md border px-3 py-2 text-sm">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {serverError && (
        <div className="bg-danger/10 border-danger/30 text-danger mt-4 flex max-w-md items-center gap-2 rounded-md border px-3 py-2 text-sm">
          <AlertCircle className="size-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-2 max-w-md sm:flex-row" noValidate>
        <div className="flex-1">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <Input
            id="newsletter-email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-small text-danger mt-1">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} size="md" className="shrink-0 self-start sm:self-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Subscribing...
            </>
          ) : (
            "Subscribe"
          )}
        </Button>
      </form>
    </div>
  );
}
