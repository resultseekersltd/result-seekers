"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import {
  getEducation,
  addEducation,
  updateEducation,
  deleteEducation,
  ExpertApiError,
} from "@/lib/api/expert-pool";
import type { ExpertEducation } from "@/types/expert-pool";
import { GraduationCap, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, Loader2, Calendar } from "lucide-react";

export default function EducationPage() {
  const [educationList, setEducationList] = useState<ExpertEducation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [institution, setInstitution] = useState("");
  const [qualification, setQualification] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [startYear, setStartYear] = useState<number | "">("");
  const [endYear, setEndYear] = useState<number | "">("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    loadEducation();
  }, []);

  function loadEducation() {
    getEducation()
      .then((res) => setEducationList(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  function openNewForm() {
    setEditingId(null);
    setInstitution("");
    setQualification("");
    setFieldOfStudy("");
    setStartYear("");
    setEndYear("");
    setCountry("");
    setIsFormOpen(true);
  }

  function openEditForm(edu: ExpertEducation) {
    setEditingId(edu.id);
    setInstitution(edu.institution);
    setQualification(edu.qualification);
    setFieldOfStudy(edu.field_of_study || "");
    setStartYear(edu.start_year);
    setEndYear(edu.end_year !== null ? edu.end_year : "");
    setCountry(edu.country || "");
    setIsFormOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload = {
      institution,
      qualification,
      field_of_study: fieldOfStudy || null,
      start_year: Number(startYear),
      end_year: endYear === "" ? null : Number(endYear),
      country: country || null,
    };

    try {
      if (editingId) {
        await updateEducation(editingId, payload);
        setSuccess("Education entry updated successfully.");
      } else {
        await addEducation(payload);
        setSuccess("New education entry added successfully.");
      }
      setIsFormOpen(false);
      loadEducation();
    } catch (err) {
      if (err instanceof ExpertApiError) {
        setError(err.message);
      } else {
        setError("Failed to save education entry.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this education entry?")) return;

    try {
      await deleteEducation(id);
      setSuccess("Education entry deleted.");
      loadEducation();
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
            <GraduationCap className="size-6 text-primary" />
            Education & Academic Degrees
          </h1>
          <p className="text-body text-muted-foreground mt-1">
            Manage your degrees, certifications, and academic qualifications.
          </p>
        </div>
        <Button onClick={openNewForm}>
          <Plus className="size-4 mr-2" /> Add Degree
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
              {editingId ? "Edit Academic Qualification" : "Add Academic Qualification"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField htmlFor="edu-inst" label="Institution" required>
                <Input
                  id="edu-inst"
                  type="text"
                  placeholder="University of Cambridge"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  required
                />
              </FormField>

              <FormField htmlFor="edu-qual" label="Qualification / Degree" required description="e.g. PhD, Master of Science">
                <Input
                  id="edu-qual"
                  type="text"
                  placeholder="Master of Science (MSc)"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  required
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField htmlFor="edu-field" label="Field of Study">
                <Input
                  id="edu-field"
                  type="text"
                  placeholder="Data Science & AI"
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                />
              </FormField>

              <FormField htmlFor="edu-start-year" label="Start Year" required>
                <Input
                  id="edu-start-year"
                  type="number"
                  min="1940"
                  max={new Date().getFullYear() + 1}
                  placeholder="2016"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value === "" ? "" : Number(e.target.value))}
                  required
                />
              </FormField>

              <FormField htmlFor="edu-end-year" label="End Year (or Expected)">
                <Input
                  id="edu-end-year"
                  type="number"
                  min="1940"
                  max={new Date().getFullYear() + 5}
                  placeholder="2018"
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </FormField>
            </div>

            <FormField htmlFor="edu-country" label="Country">
              <Input
                id="edu-country"
                type="text"
                placeholder="United Kingdom"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </FormField>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Qualification"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Education List */}
      {educationList.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <GraduationCap className="size-10 mx-auto mb-2 opacity-50" />
          <p>No academic qualifications added yet. Click &quot;Add Degree&quot; to add one.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {educationList.map((edu) => (
            <Card key={edu.id} className="p-5 md:p-6 flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-h4 font-semibold text-foreground">{edu.qualification}</h3>
                  {edu.field_of_study && (
                    <span className="text-small text-muted-foreground">in {edu.field_of_study}</span>
                  )}
                </div>
                <div className="text-small text-primary font-medium">{edu.institution}</div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {edu.start_year} – {edu.end_year ? edu.end_year : "Present"}
                  </span>
                  {edu.country && <span>· {edu.country}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-start shrink-0">
                <Button variant="ghost" size="sm" onClick={() => openEditForm(edu)}>
                  <Edit2 className="size-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(edu.id)} className="text-danger hover:text-danger">
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
