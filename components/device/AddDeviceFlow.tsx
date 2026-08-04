"use client";

import { useState } from "react";
import { Card, BackLink, PageTitle } from "../ui/Card";
import { Button, ButtonLink } from "../ui/Button";
import { SuccessPanel } from "../ui/Feedback";
import { ClaimCodeField } from "./ClaimCodeField";
import type { ClaimCodeState } from "@/lib/types";

/* Add a device → /devices/add · source: GreenGo Add Device.dc.html
 * Spec: handoff/tenant.md §5. Claim code only, no account fields — for an
 * already-authenticated user. Different prototype code from Login:
 * GG-9K21-P4 is valid here (GG-4F82-K1 is already claimed in this scenario). */

const CODE_MAP: Record<string, ClaimCodeState> = {
  "GG-9K21-P4": "valid",
  "GG-1111-11": "claimed",
  "GG-2222-22": "expired",
};

function checkCode(code: string): ClaimCodeState | null {
  const c = code.trim().toUpperCase();
  if (!c) return null;
  return CODE_MAP[c] ?? "invalid";
}

export function AddDeviceFlow() {
  const [step, setStep] = useState<"form" | "success">("form");
  const [codeInput, setCodeInput] = useState("GG-9K21-P4");

  const status = checkCode(codeInput);

  if (step === "success") {
    return (
      <Card variant="hero" className="mt-3.5">
        <SuccessPanel
          size="lg"
          headingLevel="h2"
          title="Device added"
          body="Greenhouse 2 is linked to your account. Calibration starts next."
          action={
            <ButtonLink href="/devices" variant="primary" size="sm">
              Go to your devices
            </ButtonLink>
          }
        />
      </Card>
    );
  }

  return (
    <>
      <PageTitle className="mt-3.5 mb-2">Add a device</PageTitle>
      <p className="text-base text-muted m-0 mb-6">
        This links a new greenhouse to your existing account — no new login
        needed.
      </p>

      <Card className="flex flex-col gap-2.5">
        <ClaimCodeField
          value={codeInput}
          onChange={setCodeInput}
          state={status}
          hint={
            <div className="text-label leading-normal text-faint">
              Prototype codes — GG-9K21-P4 valid · GG-1111-11 already claimed ·
              GG-2222-22 expired · anything else not recognised.
            </div>
          }
        />
        <Button
          variant="primary"
          size="md"
          disabled={status !== "valid"}
          className="mt-1"
          onClick={() => setStep("success")}
        >
          Add device
        </Button>
      </Card>
    </>
  );
}

export function AddDeviceBackLink() {
  return <BackLink href="/devices">← All devices</BackLink>;
}
