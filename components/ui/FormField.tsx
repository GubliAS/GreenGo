"use client";

import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";

/* Label 12.5px/600/canopy with 6px gap, over an input at --radius-input.
 *
 * DEV-001: radius is 14px per the handoff README, not the 10px the HTML
 * renders. Ruling #3.
 *
 * Padding varies by context in the handoff, hence the size prop:
 *   lg    13px 14px · 14.5px — login / claim primary fields
 *   md    12px 14px · 14.5px — marketing forms (Pricing, Contact)
 *   sm    11px 12px · 14px   — Settings, Admin Account
 *   xs    10px 12px · 14px   — Alerts numeric inputs, Quiet hours
 *   inline 9px 12px · 13px   — admin typed-confirmation rows
 */

export type FieldSize = "lg" | "md" | "sm" | "xs" | "inline";

const SIZES: Record<FieldSize, string> = {
  lg: "px-3.5 py-3.25 text-md",
  md: "px-3.5 py-3 text-md",
  sm: "px-3 py-2.75 text-base",
  xs: "px-3 py-2.5 text-base",
  inline: "px-3 py-2.25 text-sm",
};

const INPUT_BASE =
  "w-full box-border border-hair rounded-input bg-white transition-colors duration-250 ease-ui " +
  "placeholder:text-faint";

export function Label({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-meta text-canopy mb-1.5 block font-semibold"
    >
      {children}
    </label>
  );
}

export function FormField({
  label,
  size = "lg",
  mono = false,
  error,
  hint,
  readOnly,
  className,
  id: providedId,
  ...rest
}: {
  label?: ReactNode;
  size?: FieldSize;
  /** Mono + uppercase — claim codes, MAC addresses. Never for names or phone
   *  numbers: the handoff README is explicit that user-entered text stays in
   *  Public Sans. */
  mono?: boolean;
  error?: string;
  hint?: ReactNode;
  /* `size` is omitted from the native input props below: HTML inputs have their
   * own numeric `size` attribute, which would intersect with FieldSize to
   * `never`. We never need the native one. */
} & Omit<ComponentProps<"input">, "className" | "size"> & { className?: string }) {
  const autoId = useId();
  const id = providedId ?? autoId;
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(" ");

  const border = error
    ? "border-danger-border"
    : readOnly
      ? "border-line-soft"
      : "border-line";

  const surface = readOnly
    ? "bg-stone text-muted cursor-not-allowed"
    : "text-canopy";

  return (
    <div className={className}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <input
        {...rest}
        id={id}
        readOnly={readOnly}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={`${INPUT_BASE} ${SIZES[size]} ${border} ${surface} ${
          mono ? "font-mono uppercase" : "font-body"
        }`}
      />
      {hint && (
        <div id={`${id}-hint`} className="text-label text-muted leading-normal mt-1.25">
          {hint}
        </div>
      )}
      {error && (
        <div
          id={`${id}-error`}
          className="text-sm text-danger mt-1.5 font-semibold"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
}

export function TextareaField({
  label,
  hint,
  error,
  className,
  id: providedId,
  ...rest
}: {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
} & Omit<ComponentProps<"textarea">, "className"> & { className?: string }) {
  const autoId = useId();
  const id = providedId ?? autoId;

  return (
    <div className={className}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <textarea
        {...rest}
        id={id}
        aria-invalid={error ? true : undefined}
        className={`${INPUT_BASE} px-3.5 py-3 text-md text-canopy resize-y ${
          error ? "border-danger-border" : "border-line"
        }`}
      />
      {hint && <div className="text-label text-muted mt-1.25">{hint}</div>}
      {error && (
        <div className="text-sm text-danger mt-1.5 font-semibold" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
