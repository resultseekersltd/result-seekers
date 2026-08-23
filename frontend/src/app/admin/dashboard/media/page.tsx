"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Upload, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { listMedia, uploadMedia, deleteMedia, AdminApiError, type Media } from "@/lib/api/admin";

export default function AdminMediaPage() {
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Media | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    listMedia()
      .then((res) => setItems(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see audit-log/page.tsx's comment
    load();
  }, [load]);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      await uploadMedia(file);
      load();
    } catch (err) {
      setUploadError(err instanceof AdminApiError ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMedia(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } finally {
      setDeleting(false);
    }
  }

  function copyUrl(item: Media) {
    navigator.clipboard.writeText(item.url).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-h2 text-foreground">Media Library</h1>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleFileSelected}
            className="sr-only"
            id="media-upload-input"
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Upload className="size-4" aria-hidden="true" />
            {uploading ? "Uploading..." : "Upload Image"}
          </Button>
        </div>
      </div>

      {uploadError && (
        <div className="rounded-input border-danger/30 bg-danger/10 text-small text-danger mb-6 border p-3">
          {uploadError}
        </div>
      )}

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <ErrorState description="We couldn't load the media library." retry={{ label: "Retry", onRetry: load }} />
      ) : items.length === 0 ? (
        <EmptyState title="No media yet" description="Upload an image to get started." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="border-border rounded-card overflow-hidden border">
              <div className="bg-muted relative aspect-square">
                <Image src={item.url} alt={item.altText ?? item.originalName} fill className="object-cover" unoptimized />
              </div>
              <div className="p-3">
                <p className="text-small text-foreground truncate font-medium">{item.originalName}</p>
                <p className="text-caption text-muted-foreground mt-0.5">{(item.size / 1024).toFixed(0)} KB</p>
                <div className="mt-2 flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => copyUrl(item)} className="px-2">
                    {copiedId === item.id ? (
                      <Check className="size-4" aria-hidden="true" />
                    ) : (
                      <Copy className="size-4" aria-hidden="true" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(item)}
                    className="hover:text-danger px-2"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete this image?"
        description="This cannot be undone. If it's still used on the site, that reference will break."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </>
        }
      />
    </div>
  );
}
