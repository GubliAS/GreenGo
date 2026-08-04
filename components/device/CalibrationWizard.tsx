"use client";

import { useState } from "react";
import { BackLink, Card, PageTitle } from "../ui/Card";
import { AlertBanner } from "../ui/AlertBanner";
import { Button } from "../ui/Button";
import { SuccessPanel } from "../ui/Feedback";
import { MetricReadout } from "../ui/StatCard";
import { soilRawToPercent } from "@/lib/moisture";

/* /devices/[id]/calibration — DEV-005, no handoff design. The only reference
 * is the admin Device Detail's READ-ONLY Calibration tab (dry/wet raw values +
 * the uncalibrated warning banner). This composes a 3-step wizard from that
 * plus the claim flow's step pattern (handoff/tenant.md §8):
 *   1. Dry reading — lift the probe out, wipe dry, capture soilRaw
 *   2. Wet reading — place in thoroughly watered soil, capture soilRaw
 *   3. Confirm — show both raws + the resulting percentage, save
 *
 * The "live soilRaw" is mocked with a fixed-ish reading here; Phase 4B reads
 * the device's actual last-reported soilRaw instead. */

type Step = "dry" | "wet" | "confirm" | "done";

const MOCK_LIVE_RAW_DRY = 615;
const MOCK_LIVE_RAW_WET = 202;

export function CalibrationWizard({ deviceLabel }: { deviceLabel: string }) {
  const [step, setStep] = useState<Step>("dry");
  const [dryRaw, setDryRaw] = useState<number | null>(null);
  const [wetRaw, setWetRaw] = useState<number | null>(null);

  if (step === "done") {
    return (
      <Card variant="hero">
        <SuccessPanel
          headingLevel="h2"
          title="Calibration saved"
          body={`${deviceLabel} will now report soil moisture as a percentage.`}
        />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4.5">
      <div>
        <BackLink href="/devices/gh-1">← {deviceLabel}</BackLink>
        <PageTitle className="mt-1.5">Calibrate soil sensor</PageTitle>
      </div>

      {step === "dry" && (
        <Card className="flex flex-col gap-4">
          <div className="text-lg text-canopy font-bold">Step 1 of 3 — Dry reading</div>
          <p className="text-md text-muted m-0">
            Lift the probe out of the soil and wipe it dry, then capture the
            reading.
          </p>
          <MetricReadout label="Live raw value" value={MOCK_LIVE_RAW_DRY} />
          <Button
            variant="primary"
            size="md"
            className="self-start"
            onClick={() => {
              setDryRaw(MOCK_LIVE_RAW_DRY);
              setStep("wet");
            }}
          >
            Capture dry reading
          </Button>
        </Card>
      )}

      {step === "wet" && (
        <Card className="flex flex-col gap-4">
          <div className="text-lg text-canopy font-bold">Step 2 of 3 — Wet reading</div>
          <p className="text-md text-muted m-0">
            Place the probe in thoroughly watered soil, then capture the
            reading.
          </p>
          <MetricReadout label="Live raw value" value={MOCK_LIVE_RAW_WET} />
          <Button
            variant="primary"
            size="md"
            className="self-start"
            onClick={() => {
              setWetRaw(MOCK_LIVE_RAW_WET);
              setStep("confirm");
            }}
          >
            Capture wet reading
          </Button>
        </Card>
      )}

      {step === "confirm" && dryRaw !== null && wetRaw !== null && (
        <Card className="flex flex-col gap-4">
          <div className="text-lg text-canopy font-bold">Step 3 of 3 — Confirm</div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
            <MetricReadout label="Dry raw value" value={dryRaw} />
            <MetricReadout label="Wet raw value" value={wetRaw} />
            <MetricReadout
              label="Current reading"
              value={soilRawToPercent(MOCK_LIVE_RAW_DRY - 200, { dryRaw, wetRaw }) ?? "—"}
              unit="%"
            />
          </div>
          <AlertBanner tone="mint">
            These values replace any existing calibration for {deviceLabel}.
          </AlertBanner>
          <Button variant="primary" size="md" className="self-start" onClick={() => setStep("done")}>
            Save calibration
          </Button>
        </Card>
      )}
    </div>
  );
}
