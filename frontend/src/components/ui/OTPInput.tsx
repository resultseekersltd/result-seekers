"use client";

import { useRef, type ChangeEvent } from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  /** Number of digits (default 6). */
  length?: number;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
}

/**
 * Single-field OTP input that renders individual digit boxes.
 * Accepts paste events (browser autofill works) and arrow-key navigation.
 * Used for MFA TOTP code entry.
 */
export function OTPInput({ length = 6, value, onChange, invalid, disabled }: OTPInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  function focus(index: number) {
    inputs.current[index]?.focus();
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>, index: number) {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    const next = value.split("");
    next[index] = char;
    const updated = next.join("").padEnd(length, "").slice(0, length);
    onChange(updated.trimEnd()); // remove trailing blanks so value stays clean

    if (char && index < length - 1) focus(index + 1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        // Move back and clear previous cell
        const next = value.split("");
        next[index - 1] = "";
        onChange(next.join("").trimEnd());
        focus(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focus(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      focus(index + 1);
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    onChange(pasted);
    focus(Math.min(pasted.length, length - 1));
  }

  return (
    <div
      className="flex gap-2"
      role="group"
      aria-label="One-time password"
    >
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of ${length}`}
          aria-invalid={invalid || undefined}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          className={cn(
            // Size — each cell is a fixed square
            "h-12 w-10 text-center text-h4 font-semibold",
            // Style
            "rounded-input border border-border bg-background text-foreground",
            "transition-colors",
            // Focus
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            // Invalid
            invalid && "border-danger focus-visible:outline-danger",
            // Disabled
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        />
      ))}
    </div>
  );
}
