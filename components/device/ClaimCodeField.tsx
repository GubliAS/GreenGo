"use client";

import { useId } from "react";
import type { ClaimCodeState } from "@/lib/types";
import { Label } from "../ui/FormField";

/* Byte-identical logic in GreenGo Login and GreenGo Add Device, so it is one
 * component. The four states and their exact copy are ported verbatim — this
 * is user-facing text the handoff treats as final. */

type Feedback = {
  title: string;
  sub: string;
  textClass: string;
  boxClass: string;
  borderClass: string;
};

export const CLAIM_FEEDBACK: Record<ClaimCodeState, Feedback> = {
  valid: {
    title: "Device found — Greenhouse unit, unclaimed",
    sub: "",
    textClass: "text-canopy",
    boxClass: "bg-mint border-leaf",
    borderClass: "border-leaf",
  },
  claimed: {
    title: "Already claimed by another account",
    sub: "This code is linked to a different farm. Contact support if you believe this is a mistake.",
    textClass: "text-danger",
    boxClass: "bg-danger-bg border-danger-border",
    borderClass: "border-danger-border",
  },
  expired: {
    title: "This code has expired",
    sub: "Claim codes are single-use and time-limited. Contact support for a replacement sticker.",
    textClass: "text-warn-text",
    boxClass: "bg-warn-bg border-pending",
    borderClass: "border-pending",
  },
  invalid: {
    title: "Code not recognised",
    sub: "Double-check the sticker inside the device enclosure — codes look like GG-XXXX-XX.",
    textClass: "text-muted",
    boxClass: "bg-stone border-line",
    borderClass: "border-line",
  },
};

export function ClaimCodeField({
  value,
  onChange,
  state,
  label = "Device claim code",
  hint,
}: {
  value: string;
  onChange: (v: string) => void;
  /** null while the field is empty — no feedback box is shown. */
  state: ClaimCodeState | null;
  label?: string;
  hint?: React.ReactNode;
}) {
  const id = useId();
  const fb = state ? CLAIM_FEEDBACK[state] : null;

  return (
    <div className="flex flex-col gap-2.5">
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. GG-4F82-K1"
        autoComplete="off"
        spellCheck={false}
        aria-describedby={fb ? `${id}-feedback` : undefined}
        aria-invalid={state && state !== "valid" ? true : undefined}
        className={`border-hair rounded-input text-lg text-canopy box-border w-full bg-white px-3.5 py-3.25 font-mono uppercase ${
          fb ? fb.borderClass : "border-line"
        }`}
      />

      {fb && (
        <div
          id={`${id}-feedback`}
          role="status"
          className={`border-hair rounded-tile px-3.5 py-3 ${fb.boxClass}`}
        >
          <div className={`text-sm font-semibold ${fb.textClass}`}>{fb.title}</div>
          {fb.sub && (
            <div className="text-meta text-muted leading-normal mt-1.5">{fb.sub}</div>
          )}
        </div>
      )}

      {hint}
    </div>
  );
}
