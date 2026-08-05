"use client";

import { useEffect, useState } from "react";
import { Card, BackLink, PageTitle } from "../ui/Card";
import { Button, ButtonLink } from "../ui/Button";
import { SuccessPanel } from "../ui/Feedback";
import { ClaimCodeField } from "./ClaimCodeField";
import type { ClaimCodeState } from "@/lib/types";

/* Add a device → /devices/add · source: GreenGo Add Device.dc.html
 * Spec: handoff/tenant.md §5. Claim code only, no account fields — for an
 * already-authenticated user. Phase 4B: wired to GET /api/auth/claim-code
 * (real lookup) and POST /api/auth/claim-device (real, session-scoped,
 * atomic redemption). */

export function AddDeviceFlow() {
  const [step, setStep] = useState<"form" | "success">("form");
  const [codeInput, setCodeInput] = useState("");
  const [status, setStatus] = useState<ClaimCodeState | null>(null);
  const [deviceLabel, setDeviceLabel] = useState("Your greenhouse");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const code = codeInput.trim();
    if (!code) {
      setStatus(null);
      return;
    }
    const handle = setTimeout(() => {
      fetch(`/api/auth/claim-code?code=${encodeURIComponent(code)}`)
        .then((r) => r.json())
        .then((data) => setStatus(data.status))
        .catch(() => setStatus(null));
    }, 300);
    return () => clearTimeout(handle);
  }, [codeInput]);

  async function handleSubmit() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/claim-device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeInput }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not claim this device.");
        return;
      }
      setDeviceLabel(data.deviceLabel || "Your greenhouse");
      setStep("success");
    } finally {
      setBusy(false);
    }
  }

  if (step === "success") {
    return (
      <Card variant="hero" className="mt-3.5">
        <SuccessPanel
          size="lg"
          headingLevel="h2"
          title="Device added"
          body={`${deviceLabel} is linked to your account. Calibration starts next.`}
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
        <ClaimCodeField value={codeInput} onChange={setCodeInput} state={status} />
        {error && (
          <div className="text-sm text-danger font-semibold" role="alert">
            {error}
          </div>
        )}
        <Button
          variant="primary"
          size="md"
          disabled={status !== "valid" || busy}
          className="mt-1"
          onClick={handleSubmit}
        >
          {busy ? "Adding device…" : "Add device"}
        </Button>
      </Card>
    </>
  );
}

export function AddDeviceBackLink() {
  return <BackLink href="/devices">← All devices</BackLink>;
}
