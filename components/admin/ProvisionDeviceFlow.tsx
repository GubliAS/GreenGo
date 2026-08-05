"use client";

import { useState } from "react";
import { BackLink, PageTitle, Card } from "../ui/Card";
import { AlertBanner } from "../ui/AlertBanner";
import { Button } from "../ui/Button";
import { FormField } from "../ui/FormField";
import { SuccessPanel } from "../ui/Feedback";

/* Provision device → /admin/devices/provision · source: GreenGo Admin Provision Device.dc.html
 * Spec: handoff/admin.md §4. The "shown once" warning appears BEFORE
 * generation, and the API key is never retrievable after this screen. */

export function ProvisionDeviceFlow() {
  const [step, setStep] = useState<"form" | "generated">("form");
  const [mac, setMac] = useState("");
  const [label, setLabel] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [claimCode, setClaimCode] = useState("");
  const [apiKey, setApiKey] = useState("");

  const ready = mac.trim().length > 0 && label.trim().length > 0;

  async function handleGenerate() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/devices/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mac, label }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not provision this device.");
        return;
      }
      setDeviceId(data.deviceId);
      setClaimCode(data.claimCode);
      setApiKey(data.apiKey);
      setStep("generated");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-form-sm mx-auto">
      <BackLink href="/admin/devices">← All devices</BackLink>
      <PageTitle className="mt-2 mb-5">Provision a device</PageTitle>

      {step === "form" && (
        <Card className="flex flex-col gap-4">
          <FormField
            label="MAC address"
            placeholder="A4:CF:12:8E:3B:03"
            mono
            value={mac}
            onChange={(e) => setMac(e.target.value)}
            size="md"
          />
          <FormField
            label="Device label"
            placeholder="e.g. Greenhouse 2"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            size="md"
          />

          <AlertBanner tone="warn" size="sm">
            <strong>The API key is shown once.</strong> After you leave this
            screen, it cannot be retrieved again — only regenerated, which
            breaks the device until reflashed. Copy it to the enclosure
            sticker or a secure note before continuing.
          </AlertBanner>

          {error && (
            <div className="text-sm text-danger font-semibold" role="alert">
              {error}
            </div>
          )}

          <Button
            variant="primary"
            size="md"
            disabled={!ready || busy}
            onClick={handleGenerate}
          >
            {busy ? "Generating…" : "Generate device credentials"}
          </Button>
        </Card>
      )}

      {step === "generated" && (
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-4">
            <SuccessPanel size="sm" title="Device provisioned" />

            <div>
              <div className="text-label text-muted tracking-widest mb-1.25 uppercase">
                Device ID
              </div>
              <div className="font-mono text-base text-canopy">{deviceId}</div>
            </div>
            <div>
              <div className="text-label text-muted tracking-widest mb-1.25 uppercase">
                Claim code
              </div>
              <div className="font-mono text-base text-canopy">{claimCode}</div>
            </div>

            <div>
              <div className="text-label text-muted tracking-widest mb-1.25 uppercase">
                API key — shown once
              </div>
              <div className="flex items-center gap-2.5">
                <div className="bg-app rounded-sm font-mono text-body text-canopy flex-1 break-all px-3.5 py-2.5">
                  {apiKey}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => {
                    navigator.clipboard?.writeText(apiKey).catch(() => {});
                    setCopied(true);
                  }}
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
          </Card>

          <div className="bg-canopy rounded-card flex flex-col gap-2.5 p-6.5">
            <div className="text-caption tracking-widest font-semibold text-white/60 uppercase">
              Printable enclosure sticker
            </div>
            <div className="rounded-button max-w-70 flex flex-col gap-1.5 bg-white p-5">
              <div className="font-display text-lg font-extrabold text-canopy">
                Green<span className="text-leaf">Go</span>
              </div>
              <div className="text-sm text-ink mt-1.5">{label || "Greenhouse 2"}</div>
              <div className="font-mono text-xl tracking-sliver text-canopy font-semibold">
                {claimCode}
              </div>
            </div>
            <Button variant="onGreen" size="sm" className="mt-1 self-start">
              Print sticker
            </Button>
          </div>

          <a href="/admin/devices" className="text-body self-start font-semibold">
            Done — back to devices
          </a>
        </div>
      )}
    </div>
  );
}
