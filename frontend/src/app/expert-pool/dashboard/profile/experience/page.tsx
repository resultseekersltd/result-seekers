"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  getExperiences,
  addExperience,
  updateExperience,
  deleteExperience,
  ExpertApiError,
} from "@/lib/api/expert-pool";
import type { ExpertExperience } from "@/types/expert-pool";
import { Briefcase, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, Loader2, Calendar } from "lucide-react";

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState<ExpertExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [organization, setOrganization] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [country, setCountry] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadExperiences();
  }, []);

  function loadExperiences() {
    getExperiences()
      .then((res) => setExperiences(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  function openNewForm() {
    setEditingId(null);
    setOrganization("");
    setJobTitle("");
    setCountry("");
    setStartDate("");
    setEndDate("");
    setIsCurrent(false);
    setDescription("");
    setIsFormOpen(true);
  }

  function openEditForm(exp: ExpertExperience) {
    setEditingId(exp.id);
    setOrganization(exp.organization);
    setJobTitle(exp.job_title);
    setCountry(exp.country || "");
    setStartDate(exp.start_date);
    setEndDate(exp.end_date || "");
    setIsCurrent(exp.is_current);
    setDescription(exp.description || "");
    setIsFormOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload = {
      organization,
      job_title: jobTitle,
      country: country || null,
      start_date: startDate,
      end_date: isCurrent ? null : endDate || null,
      is_current: isCurrent,
      description: description || null,
    };

    try {
      if (editingId) {
        await updateExperience(editingId, payload);
        setSuccess("Experience entry updated successfully.");
      } else {
        await addExperience(payload);
        setSuccess("New experience entry added successfully.");
      }
      setIsFormOpen(false);
      loadExperiences();
    } catch (err) {
      if (err instanceof ExpertApiError) {
        setError(err.message);
      } else {
        setError("Failed to save experience entry.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this experience entry?")) return;

    try {
      await deleteExperience(id);
      setSuccess("Experience entry deleted.");
      loadExperiences();
    } catch (err) {
      if (err instanceof ExpertApiError) setError(err.message);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-h2 font-bold tracking-tight text-foreground flex items-center gap-2">
            <Briefcase className="size-6 text-primary" />
            Work Experience
          </h1>
          <p className="text-body text-muted-foreground mt-1">
            Manage your employment history, consulting roles, and advisory engagements.
          </p>
        </div>
        <Button onClick={openNewForm}>
          <Plus className="size-4 mr-2" /> Add Experience
        </Button>
      </div>

      {success && (
        <div className="rounded-card border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
          <CheckCircle2 className="size-5 shrink-0" />
          <span className="text-small font-medium">{success}</span>
        </div>
      )}

      {error && (
        <div className="rounded-card border border-danger/30 bg-danger/10 p-4 text-danger flex items-center gap-3">
          <AlertCircle className="size-5 shrink-0" />
          <span className="text-small font-medium">{error}</span>
        </div>
      )}

      {/* Form Card */}
      {isFormOpen && (
        <Card className="p-6 md:p-8 border-primary/40 bg-primary/5">
          <form onSubmit={handleSave} className="space-y-4 max-w-2xl">
            <h2 className="text-h3 font-bold text-foreground">
              {editingId ? "Edit Work Experience" : "Add Work Experience"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField htmlFor="exp-title" label="Job / Advisory Title" required>
                <Input
                  id="exp-title"
                  type="text"
                  placeholder="Senior Consultant"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                />
              </FormField>

              <FormField htmlFor="exp-org" label="Organization" required>
                <Input
                  id="exp-org"
                  type="text"
                  placeholder="World Bank Group"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  required
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField htmlFor="exp-country" label="Country">
                <Input
                  id="exp-country"
                  type="text"
                  placeholder="Switzerland"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </FormField>

              <FormField htmlFor="exp-start-date" label="Start Date" required>
                <Input
                  id="exp-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </FormField>

              <FormField htmlFor="exp-end-date" label="End Date">
                <Input
                  id="exp-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isCurrent}
                />
              </FormField>
            </div>

            <label className="flex items-center gap-2 text-small text-foreground cursor-pointer pt-1">
              <Checkbox
                checked={isCurrent}
                onChange={(e) => setIsCurrent(e.target.checked)}
              />
              <span>I currently work in this role</span>
            </label>

            <FormField htmlFor="exp-description" label="Description & Key Contributions">
              <Textarea
                id="exp-description"
                rows={4}
                placeholder="Key deliverables, team size, research methodology..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormField>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Entry"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Experience List */}
      {experiences.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <Briefcase className="size-10 mx-auto mb-2 opacity-50" />
          <p>No work experience entries recorded yet. Click &quot;Add Experience&quot; to add one.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <Card key={exp.id} className="p-5 md:p-6 flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-h4 font-semibold text-foreground">{exp.job_title}</h3>
                  <span className="text-small text-primary font-medium">@ {exp.organization}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {exp.start_date} – {exp.is_current ? "Present" : exp.end_date}
                  </span>
                  {exp.country && <span>· {exp.country}</span>}
                </div>
                {exp.description && (
                  <p className="text-small text-foreground/90 mt-2 whitespace-pre-line">
                    {exp.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 self-end md:self-start shrink-0">
                <Button variant="ghost" size="sm" onClick={() => openEditForm(exp)}>
                  <Edit2 className="size-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(exp.id)} className="text-danger hover:text-danger">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
