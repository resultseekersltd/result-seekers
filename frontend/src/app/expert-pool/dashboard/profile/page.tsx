"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { getProfile, updateProfile, ExpertApiError } from "@/lib/api/expert-pool";
import { User, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function PersonalDetailsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [preferredName, setPreferredName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    getProfile()
      .then((res) => {
        const p = res.data;
        setPreferredName(p.preferred_name || "");
        setPhone(p.phone || "");
        setCountry(p.country || "");
        setState(p.state || "");
        setCity(p.city || "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      await updateProfile({
        preferred_name: preferredName,
        phone,
        country,
        state,
        city,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      if (err instanceof ExpertApiError) {
        setError(err.message);
      } else {
        setError("Failed to update personal details.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-h2 font-bold tracking-tight text-foreground flex items-center gap-2">
          <User className="size-6 text-primary" />
          Personal Details
        </h1>
        <p className="text-body text-muted-foreground mt-1">
          Update your contact details and geographic location.
        </p>
      </div>

      {success && (
        <div className="rounded-card border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
          <CheckCircle2 className="size-5 shrink-0" />
          <span className="text-small font-medium">Personal details saved successfully!</span>
        </div>
      )}

      {error && (
        <div className="rounded-card border border-danger/30 bg-danger/10 p-4 text-danger flex items-center gap-3">
          <AlertCircle className="size-5 shrink-0" />
          <span className="text-small font-medium">{error}</span>
        </div>
      )}

      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
          <FormField htmlFor="personal-pref-name" label="Preferred Name" description="How you wish to be addressed in expert briefings">
            <Input
              id="personal-pref-name"
              type="text"
              placeholder="Dr. Jane Doe"
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
            />
          </FormField>

          <FormField htmlFor="personal-phone" label="Phone Number" required>
            <Input
              id="personal-phone"
              type="tel"
              placeholder="+44 20 7946 0912"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField htmlFor="personal-country" label="Country" required>
              <Input
                id="personal-country"
                type="text"
                placeholder="United Kingdom"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </FormField>

            <FormField htmlFor="personal-state" label="State / Province">
              <Input
                id="personal-state"
                type="text"
                placeholder="Greater London"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </FormField>

            <FormField htmlFor="personal-city" label="City" required>
              <Input
                id="personal-city"
                type="text"
                placeholder="London"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </FormField>
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Personal Details"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
