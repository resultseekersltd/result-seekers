"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface TagListInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

/** Freeform string-array editor — used for Solution services/outputs/tools, Product target_users/features, Vacancy requirements. */
export function TagListInput({ value, onChange }: TagListInputProps) {
  const [draft, setDraft] = useState("");

  function add() {
    const trimmed = draft.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setDraft("");
  }

  return (
    <div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Type a value and press Enter"
        />
        <Button type="button" variant="secondary" size="md" onClick={add} className="shrink-0">
          Add
        </Button>
      </div>
      {value.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {value.map((item) => (
            <li key={item}>
              <Badge variant="outline" className="gap-1.5 normal-case">
                {item}
                <button
                  type="button"
                  onClick={() => onChange(value.filter((v) => v !== item))}
                  aria-label={`Remove ${item}`}
                  className="hover:text-danger"
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
