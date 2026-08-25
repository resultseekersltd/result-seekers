"use client";

import { useEffect, useState } from "react";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { TagListInput } from "@/components/admin/TagListInput";
import { listResource } from "@/lib/api/admin";
import type { FieldSchema } from "@/components/admin/resource-config";

interface ResourceFormProps {
  fields: FieldSchema[];
  values: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
  errors?: Record<string, string[]>;
}

/** Renders one create/edit form from a field schema — shared by every CMS content type via ResourceManager. */
export function ResourceForm({ fields, values, onChange, errors }: ResourceFormProps) {
  return (
    <div className="flex flex-col gap-5">
      {fields.map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          value={values[field.name]}
          onChange={(v) => onChange(field.name, v)}
          error={errors?.[field.name]?.[0]}
        />
      ))}
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
  error,
}: {
  field: FieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}) {
  const id = `field-${field.name}`;

  switch (field.type) {
    case "text":
      return (
        <FormField htmlFor={id} label={field.label} required={field.required} error={error}>
          <Input
            id={id}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            invalid={Boolean(error)}
          />
        </FormField>
      );

    case "textarea":
      return (
        <FormField htmlFor={id} label={field.label} required={field.required} error={error}>
          <Textarea
            id={id}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            invalid={Boolean(error)}
          />
        </FormField>
      );

    case "number":
      return (
        <FormField htmlFor={id} label={field.label} required={field.required} error={error}>
          <Input
            id={id}
            type="number"
            value={(value as number | string) ?? ""}
            onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
            invalid={Boolean(error)}
          />
        </FormField>
      );

    case "date":
      return (
        <FormField htmlFor={id} label={field.label} required={field.required} error={error}>
          <Input
            id={id}
            type="date"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value || null)}
            invalid={Boolean(error)}
          />
        </FormField>
      );

    case "checkbox":
      return (
        <div className="flex items-center gap-2">
          <Checkbox id={id} checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          <Label htmlFor={id} className="cursor-pointer">
            {field.label}
          </Label>
        </div>
      );

    case "select":
      return (
        <FormField htmlFor={id} label={field.label} required={field.required} error={error}>
          <Select
            id={id}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            invalid={Boolean(error)}
          >
            <option value="" disabled>
              Select…
            </option>
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </FormField>
      );

    case "relation-select":
      return (
        <RelationSelectField
          id={id}
          field={field}
          value={value as number | string | null}
          onChange={onChange}
          error={error}
        />
      );

    case "relation-multiselect":
      return (
        <RelationMultiSelectField
          field={field}
          value={(value as (number | string)[]) ?? []}
          onChange={onChange}
        />
      );

    case "taglist":
      return (
        <FormField htmlFor={id} label={field.label} description={field.description}>
          <TagListInput value={(value as string[]) ?? []} onChange={onChange} />
        </FormField>
      );

    default:
      return null;
  }
}

/** Fetches its options from another CMS resource (e.g. article-categories for an Article's category select). */
function RelationSelectField({
  id,
  field,
  value,
  onChange,
  error,
}: {
  id: string;
  field: Extract<FieldSchema, { type: "relation-select" }>;
  value: number | string | null;
  onChange: (value: unknown) => void;
  error?: string;
}) {
  const [options, setOptions] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    listResource<Record<string, unknown>>(field.resource, { per_page: "100" })
      .then((res) => setOptions(res.data))
      .catch(() => setOptions([]));
  }, [field.resource]);

  const valueKey = field.optionValueKey ?? "id";

  return (
    <FormField htmlFor={id} label={field.label} required={field.required} error={error}>
      <Select
        id={id}
        value={value != null ? String(value) : ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        invalid={Boolean(error)}
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((opt) => (
          <option key={String(opt[valueKey])} value={String(opt[valueKey])}>
            {String(opt[field.optionLabelKey])}
          </option>
        ))}
      </Select>
    </FormField>
  );
}

/** Checkbox list fetched from another CMS resource (e.g. tags/solutions for an Article). */
function RelationMultiSelectField({
  field,
  value,
  onChange,
}: {
  field: Extract<FieldSchema, { type: "relation-multiselect" }>;
  value: (number | string)[];
  onChange: (value: unknown) => void;
}) {
  const [options, setOptions] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    listResource<Record<string, unknown>>(field.resource, { per_page: "100" })
      .then((res) => setOptions(res.data))
      .catch(() => setOptions([]));
  }, [field.resource]);

  const valueKey = field.optionValueKey ?? "id";
  const selected = new Set(value.map(String));

  function toggle(optionValue: string) {
    const numeric = Number(optionValue);
    if (selected.has(optionValue)) {
      onChange(value.filter((v) => String(v) !== optionValue));
    } else {
      onChange([...value, numeric]);
    }
  }

  if (options.length === 0) return null;

  return (
    <div>
      <Label>{field.label}</Label>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
        {options.map((opt) => {
          const optValue = String(opt[valueKey]);
          const optId = `${field.name}-${optValue}`;
          return (
            <li key={optValue} className="flex items-center gap-2">
              <Checkbox id={optId} checked={selected.has(optValue)} onChange={() => toggle(optValue)} />
              <Label htmlFor={optId} className="cursor-pointer font-normal">
                {String(opt[field.optionLabelKey])}
              </Label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
