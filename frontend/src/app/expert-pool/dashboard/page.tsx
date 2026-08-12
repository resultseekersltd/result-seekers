"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getProfile, submitProfile, ExpertApiError } from "@/lib/api/expert-pool";
import type { ExpertProfile } from "@/types/expert-pool";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  User,
  Briefcase,
  Sparkles,
  GraduationCap,
  FileText,
  Send,
  Loader2,
} from "lucide-react";

export default function DashboardOverviewPage() {
  const [profile, setProfile] = useState<ExpertProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(() => {
    getProfile()
      .then((res) => setProfile(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function handleSubmitProfile() {
    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const res = await submitProfile();
      setMessage(res.message);
      loadProfile();
    } catch (err) {
      if (err instanceof ExpertApiError) {
        setError(err.message);
      } else {
        setError("Failed to submit profile.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  const statusVariant =
    profile.status === "approved"
      ? "success"
      : profile.status === "submitted" || profile.status === "under_review"
      ? "accent"
      : "neutral";

  return (
    <div className="space-y-8">
      {/* Header card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-h2 font-bold tracking-tight text-foreground">
            Welcome, {profile.preferred_name || "Expert"}
          </h1>
          <p className="text-body text-muted-foreground mt-1">
            Manage your Expert Pool profile, experience, and advisory availability.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-small font-medium text-muted-foreground">Status:</span>
          <Badge variant={statusVariant} className="capitalize text-small px-3 py-1">
            {profile.status.replace("_", " ")}
          </Badge>
        </div>
      </div>

      {message && (
        <div className="rounded-card border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
          <CheckCircle2 className="size-5 shrink-0" />
          <span className="text-small font-medium">{message}</span>
        </div>
      )}

      {error && (
        <div className="rounded-card border border-danger/30 bg-danger/10 p-4 text-danger flex items-center gap-3">
          <AlertCircle className="size-5 shrink-0" />
          <span className="text-small font-medium">{error}</span>
        </div>
      )}

      {/* Completion Banner */}
      <Card className="p-6 md:p-8 border-primary/20 bg-primary/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-primary font-semibold text-small">
              <Clock className="size-4" />
              <span>Profile Completion</span>
            </div>
            <h2 className="text-h3 font-bold text-foreground">
              Your profile is {profile.completion_percentage}% complete
            </h2>
            {profile.completion_missing.length > 0 ? (
              <p className="text-small text-muted-foreground">
                Missing required fields: <span className="font-medium text-foreground">{profile.completion_missing.join(", ")}</span>
              </p>
            ) : (
              <p className="text-small text-emerald-600 dark:text-emerald-400 font-medium">
                All required profile information is complete! You can now submit your profile for admin review.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {profile.status === "complete" || profile.status === "incomplete" ? (
              <Button
                onClick={handleSubmitProfile}
                disabled={submitting || profile.completion_percentage < 100}
                className="w-full sm:w-auto"
              >
                <Send className="size-4 mr-2" />
                {submitting ? "Submitting..." : "Submit Profile for Review"}
              </Button>
            ) : (
              <Button variant="secondary" disabled className="w-full sm:w-auto">
                <CheckCircle2 className="size-4 mr-2 text-emerald-500" />
                Profile Submitted
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 h-2 w-full bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${profile.completion_percentage}%` }}
          />
        </div>
      </Card>

      {/* Quick Access Grid */}
      <div className="space-y-4">
        <h2 className="text-h4 font-semibold text-foreground">Profile Sections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-5 hover:border-primary transition-colors group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <User className="size-6 text-primary" />
                {profile.preferred_name && profile.phone && profile.country ? (
                  <Badge variant="success">Done</Badge>
                ) : (
                  <Badge variant="neutral">Incomplete</Badge>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  Personal Details
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Preferred name, phone number, location.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-border flex justify-end">
              <Link href="/expert-pool/dashboard/profile" className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:underline">
                Edit <ArrowRight className="size-3" />
              </Link>
            </div>
          </Card>

          <Card className="p-5 hover:border-primary transition-colors group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Briefcase className="size-6 text-primary" />
                {profile.professional_title && profile.highest_qualification ? (
                  <Badge variant="success">Done</Badge>
                ) : (
                  <Badge variant="neutral">Incomplete</Badge>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  Professional Background
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Title, current organization, bio, qualifications.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-border flex justify-end">
              <Link href="/expert-pool/dashboard/profile/professional" className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:underline">
                Edit <ArrowRight className="size-3" />
              </Link>
            </div>
          </Card>

          <Card className="p-5 hover:border-primary transition-colors group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Sparkles className="size-6 text-primary" />
                {profile.disciplines && profile.disciplines.length > 0 ? (
                  <Badge variant="success">Done</Badge>
                ) : (
                  <Badge variant="neutral">Incomplete</Badge>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  Expertise & Disciplines
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Select primary disciplines, skills, and languages.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-border flex justify-end">
              <Link href="/expert-pool/dashboard/profile/expertise" className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:underline">
                Edit <ArrowRight className="size-3" />
              </Link>
            </div>
          </Card>

          <Card className="p-5 hover:border-primary transition-colors group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Briefcase className="size-6 text-primary" />
                {profile.experiences && profile.experiences.length > 0 ? (
                  <Badge variant="success">{profile.experiences.length} Entries</Badge>
                ) : (
                  <Badge variant="neutral">Incomplete</Badge>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  Work Experience
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Detailed employment and advisory history.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-border flex justify-end">
              <Link href="/expert-pool/dashboard/profile/experience" className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:underline">
                Manage <ArrowRight className="size-3" />
              </Link>
            </div>
          </Card>

          <Card className="p-5 hover:border-primary transition-colors group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <GraduationCap className="size-6 text-primary" />
                {profile.education && profile.education.length > 0 ? (
                  <Badge variant="success">{profile.education.length} Entries</Badge>
                ) : (
                  <Badge variant="neutral">Incomplete</Badge>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  Education & Degrees
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Academic qualifications and institutions.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-border flex justify-end">
              <Link href="/expert-pool/dashboard/profile/education" className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:underline">
                Manage <ArrowRight className="size-3" />
              </Link>
            </div>
          </Card>

          <Card className="p-5 hover:border-primary transition-colors group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FileText className="size-6 text-primary" />
                {profile.has_cv ? (
                  <Badge variant="success">Uploaded</Badge>
                ) : (
                  <Badge variant="neutral">Required</Badge>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  CV / Resume File
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOC, or DOCX (Max 10 MB).
                </p>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-border flex justify-end">
              <Link href="/expert-pool/dashboard/cv" className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:underline">
                Manage <ArrowRight className="size-3" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
