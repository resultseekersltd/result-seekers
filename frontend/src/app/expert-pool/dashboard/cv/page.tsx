"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileInput } from "@/components/ui/FileInput";
import { getProfile, uploadCv, downloadCv, deleteCv, ExpertApiError } from "@/lib/api/expert-pool";
import type { ExpertProfile } from "@/types/expert-pool";
import { FileText, Download, Trash2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function CvManagementPage() {
  const [profile, setProfile] = useState<ExpertProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  function loadProfile() {
    getProfile()
      .then((res) => setProfile(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await uploadCv(selectedFile);
      setMessage(res.message);
      setSelectedFile(null);
      loadProfile();
    } catch (err) {
      if (err instanceof ExpertApiError) {
        setError(err.message);
      } else {
        setError("Failed to upload CV file.");
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    setError(null);

    try {
      const blob = await downloadCv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = profile?.cv_original_name || "expert-cv.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      if (err instanceof ExpertApiError) {
        setError(err.message);
      } else {
        setError("Failed to download CV.");
      }
    } finally {
      setDownloading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete your stored CV file?")) return;

    setDeleting(true);
    setMessage(null);
    setError(null);

    try {
      const res = await deleteCv();
      setMessage(res.message);
      loadProfile();
    } catch (err) {
      if (err instanceof ExpertApiError) {
        setError(err.message);
      } else {
        setError("Failed to delete CV.");
      }
    } finally {
      setDeleting(false);
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

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-h2 font-bold tracking-tight text-foreground flex items-center gap-2">
          <FileText className="size-6 text-primary" />
          CV / Resume Management
        </h1>
        <p className="text-body text-muted-foreground mt-1">
          Upload your detailed CV for private review by Result Seekers directors.
        </p>
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

      {/* Current File Card */}
      {profile.has_cv && (
        <Card className="p-6 md:p-8 space-y-4">
          <h2 className="text-h3 font-bold text-foreground">Current Uploaded CV</h2>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-card border border-border bg-muted/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-card bg-primary/10 text-primary">
                <FileText className="size-6" />
              </div>
              <div>
                <span className="font-semibold text-foreground block">
                  {profile.cv_original_name || "Uploaded CV File"}
                </span>
                <span className="text-xs text-muted-foreground">
                  Uploaded on {profile.cv_uploaded_at ? new Date(profile.cv_uploaded_at).toLocaleDateString() : "N/A"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={handleDownload} disabled={downloading}>
                <Download className="size-4 mr-1.5" />
                {downloading ? "Downloading..." : "Download"}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleting} className="text-danger hover:text-danger">
                <Trash2 className="size-4 mr-1.5" />
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Upload New / Replace Card */}
      <Card className="p-6 md:p-8 max-w-2xl space-y-5">
        <div>
          <h2 className="text-h3 font-bold text-foreground">
            {profile.has_cv ? "Replace CV File" : "Upload CV File"}
          </h2>
          <p className="text-small text-muted-foreground mt-1">
            Supported file formats: <span className="font-semibold text-foreground">PDF, DOC, DOCX</span> · Max file size: <span className="font-semibold text-foreground">10 MB</span>
          </p>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <FileInput
            label={selectedFile ? selectedFile.name : "Select or drag CV file here"}
            description="PDF, DOC, or DOCX up to 10 MB"
            fileName={selectedFile?.name}
            onClear={() => setSelectedFile(null)}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setSelectedFile(e.target.files[0]);
              }
            }}
          />

          <Button type="submit" disabled={uploading || !selectedFile} className="w-full sm:w-auto">
            {uploading ? "Uploading file..." : profile.has_cv ? "Replace CV File" : "Upload CV File"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
