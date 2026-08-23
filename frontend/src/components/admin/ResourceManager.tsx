"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { listResource, createResource, updateResource, deleteResource, AdminApiError } from "@/lib/api/admin";
import type { ResourceConfig } from "@/components/admin/resource-config";

/** Converts an API response's camelCase keys to the snake_case keys the backend Form Requests validate against. */
function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)] = value;
  }
  return result;
}

function renderCell(value: unknown): React.ReactNode {
  if (value === null || value === undefined) return <span className="text-muted-foreground">—</span>;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

interface ResourceManagerProps {
  config: ResourceConfig;
}

export function ResourceManager({ config }: ResourceManagerProps) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number } | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setLoadError(false);
    listResource<Record<string, unknown>>(config.resource, { page: String(page) })
      .then((res) => {
        setItems(res.data);
        setMeta(res.meta);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [config.resource, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see admin/dashboard/audit-log/page.tsx's comment
    load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setFormValues({ ...config.defaults });
    setFormErrors({});
    setSaveError(null);
    setModalOpen(true);
  }

  function openEdit(item: Record<string, unknown>) {
    setEditingId(item[config.identifierKey ?? "id"] as number | string);
    setFormValues(toSnakeCase(item));
    setFormErrors({});
    setSaveError(null);
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    setFormErrors({});

    try {
      if (editingId != null) {
        await updateResource(config.resource, editingId, formValues);
      } else {
        await createResource(config.resource, formValues);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      if (err instanceof AdminApiError) {
        setSaveError(err.message);
        setFormErrors(err.errors ?? {});
      } else {
        setSaveError("An unexpected error occurred.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteResource(config.resource, deleteTarget[config.identifierKey ?? "id"] as number | string);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setDeleteError(err instanceof AdminApiError ? err.message : "Could not delete this item.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-h2 text-foreground">{config.label}</h1>
          {meta && <p className="text-small text-muted-foreground mt-1">{meta.total} total</p>}
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          New {config.singularLabel}
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : loadError ? (
        <ErrorState description={`We couldn't load ${config.label.toLowerCase()}.`} retry={{ label: "Retry", onRetry: load }} />
      ) : items.length === 0 ? (
        <EmptyState
          title={`No ${config.label.toLowerCase()} yet`}
          description="Use the “New” button above to create the first one."
        />
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                {config.columns.map((col) => (
                  <TableHeaderCell key={col.key}>{col.label}</TableHeaderCell>
                ))}
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={String(item.id)}>
                  {config.columns.map((col) => (
                    <TableCell key={col.key}>{renderCell(item[col.key])}</TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)} aria-label="Edit">
                        <Pencil className="size-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(item)}
                        className="hover:text-danger"
                        aria-label="Delete"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {meta && meta.last_page > 1 && (
            <div className="mt-6 flex items-center justify-between gap-4">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={meta.current_page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <p className="text-small text-muted-foreground">
                Page {meta.current_page} of {meta.last_page}
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId != null ? `Edit ${config.singularLabel}` : `New ${config.singularLabel}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </>
        }
      >
        {saveError && (
          <div className="rounded-input border-danger/30 bg-danger/10 text-small text-danger mb-4 border p-3">
            {saveError}
          </div>
        )}
        <ResourceForm
          fields={config.fields}
          values={formValues}
          onChange={(name, value) => setFormValues((prev) => ({ ...prev, [name]: value }))}
          errors={formErrors}
        />
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title={`Delete ${config.singularLabel}?`}
        description="This cannot be undone."
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
      >
        {deleteError && (
          <div className="rounded-input border-danger/30 bg-danger/10 text-small text-danger p-3">{deleteError}</div>
        )}
      </Modal>
    </div>
  );
}
