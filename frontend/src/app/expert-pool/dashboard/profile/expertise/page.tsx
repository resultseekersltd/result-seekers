"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { getProfile, getDisciplines, updateProfile, ExpertApiError } from "@/lib/api/expert-pool";
import type { ExpertDiscipline } from "@/types/expert-pool";
import { Sparkles, CheckCircle2, AlertCircle, Loader2, X, Plus } from "lucide-react";

export default function ExpertisePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [allDisciplines, setAllDisciplines] = useState<ExpertDiscipline[]>([]);
  const [selectedDisciplineIds, setSelectedDisciplineIds] = useState<number[]>([]);

  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const [industries, setIndustries] = useState<string[]>([]);
  const [newIndustry, setNewIndustry] = useState("");

  const [languages, setLanguages] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState("");

  const [certifications, setCertifications] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([getDisciplines(), getProfile()])
      .then(([discRes, profileRes]) => {
        setAllDisciplines(discRes.data);
        const p = profileRes.data;
        setSelectedDisciplineIds(p.disciplines?.map((d) => d.id) || []);
        setSkills(p.skills || []);
        setIndustries(p.industries || []);
        setLanguages(p.languages || []);
        setCertifications(p.certifications || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function toggleDiscipline(id: number) {
    if (selectedDisciplineIds.includes(id)) {
      setSelectedDisciplineIds(selectedDisciplineIds.filter((dId) => dId !== id));
    } else {
      setSelectedDisciplineIds([...selectedDisciplineIds, id]);
    }
  }

  function addTag(item: string, list: string[], setList: (l: string[]) => void, setInput: (s: string) => void) {
    const trimmed = item.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
      setInput("");
    }
  }

  function removeTag(item: string, list: string[], setList: (l: string[]) => void) {
    setList(list.filter((i) => i !== item));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      await updateProfile({
        discipline_ids: selectedDisciplineIds,
        skills,
        industries,
        languages,
        certifications,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      if (err instanceof ExpertApiError) {
        setError(err.message);
      } else {
        setError("Failed to update expertise & disciplines.");
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
          <Sparkles className="size-6 text-primary" />
          Expertise & Disciplines
        </h1>
        <p className="text-body text-muted-foreground mt-1">
          Select primary expert disciplines and add tag keywords for your capabilities.
        </p>
      </div>

      {success && (
        <div className="rounded-card border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
          <CheckCircle2 className="size-5 shrink-0" />
          <span className="text-small font-medium">Expertise details saved successfully!</span>
        </div>
      )}

      {error && (
        <div className="rounded-card border border-danger/30 bg-danger/10 p-4 text-danger flex items-center gap-3">
          <AlertCircle className="size-5 shrink-0" />
          <span className="text-small font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Disciplines Selection Card */}
        <Card className="p-6 md:p-8 space-y-4">
          <div>
            <h2 className="text-h4 font-semibold text-foreground">Primary Disciplines</h2>
            <p className="text-small text-muted-foreground mt-0.5">
              Select all functional & sector disciplines relevant to your research.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {allDisciplines.map((d) => {
              const checked = selectedDisciplineIds.includes(d.id);
              return (
                <label
                  key={d.id}
                  className={`flex items-center gap-3 p-3 rounded-card border transition-colors cursor-pointer text-small ${
                    checked
                      ? "border-primary bg-primary/5 text-foreground font-medium"
                      : "border-border bg-card text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <Checkbox
                    checked={checked}
                    onChange={() => toggleDiscipline(d.id)}
                  />
                  <span>{d.name}</span>
                </label>
              );
            })}
          </div>
        </Card>

        {/* Skills Tag Card */}
        <Card className="p-6 md:p-8 space-y-4">
          <div>
            <h2 className="text-h4 font-semibold text-foreground">Skills & Methodologies</h2>
            <p className="text-small text-muted-foreground mt-0.5">
              Specific methodologies, tools, framework competencies.
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="e.g. Econometric Modeling"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag(newSkill, skills, setSkills, setNewSkill);
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => addTag(newSkill, skills, setSkills, setNewSkill)}
            >
              <Plus className="size-4 mr-1" /> Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {skills.map((s) => (
              <Badge key={s} variant="neutral" className="px-3 py-1 text-small gap-1.5">
                {s}
                <button
                  type="button"
                  onClick={() => removeTag(s, skills, setSkills)}
                  className="hover:text-danger"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        </Card>

        {/* Industries & Languages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-h4 font-semibold text-foreground">Industries</h2>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="e.g. Healthcare"
                value={newIndustry}
                onChange={(e) => setNewIndustry(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(newIndustry, industries, setIndustries, setNewIndustry);
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => addTag(newIndustry, industries, setIndustries, setNewIndustry)}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {industries.map((ind) => (
                <Badge key={ind} variant="neutral" className="px-2.5 py-1 text-xs gap-1">
                  {ind}
                  <button type="button" onClick={() => removeTag(ind, industries, setIndustries)}>
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-h4 font-semibold text-foreground">Languages</h2>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="e.g. French (Fluent)"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(newLanguage, languages, setLanguages, setNewLanguage);
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => addTag(newLanguage, languages, setLanguages, setNewLanguage)}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {languages.map((lang) => (
                <Badge key={lang} variant="neutral" className="px-2.5 py-1 text-xs gap-1">
                  {lang}
                  <button type="button" onClick={() => removeTag(lang, languages, setLanguages)}>
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </Card>
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Expertise & Disciplines"}
          </Button>
        </div>
      </form>
    </div>
  );
}
