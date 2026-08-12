"use client";

import type { DeviceState, PumpMode } from "@/lib/types";
import { Button } from "../ui/Button";
import { IndeterminateBar } from "../ui/Feedback";
import { StateDot, StatusPill } from "../ui/StatusPill";

/* The three-state vocabulary made explicit. The handoff README calls this
 * "critical — do not simplify": every pump control supports confirmed /
 * pending / unknown, never just on/off.
 *
 * MANUAL is a fourth branch. The handoff hardcodes `mode = isUnknown ? 'AUTO'
 * : 'AUTO'`, so MANUAL never renders — but the markup already carries a mode
 * pill and a modeDisabledReason slot, and the product spec requires rejecting
 * commands while the device reports MANUAL. Copy per DEV-003 (ruling #5).
 *
 * Precedence when both apply: unknown wins over MANUAL. If we cannot trust the
 * device's last report, we also cannot trust its claim about the switch — and
 * the stale banner is the more important thing to say.
 */

export type PumpView = {
  dotState: DeviceState;
  dotOn: boolean;
  statusText: string;
  buttonLabel: string;
  disabled: boolean;
  /** Explains why the control is unavailable. Empty when it is available. */
  reason: string;
  showIndeterminate: boolean;
  /** Only the unknown state raises a page-level banner: in MANUAL the readings
   *  are live and trustworthy, so a stale-data banner would be wrong. */
  showStaleBanner: boolean;
};

export function resolvePumpView({
  state,
  mode,
  relayOn,
  lastSeenLabel = "4 min ago",
}: {
  state: DeviceState;
  mode: PumpMode;
  relayOn: boolean;
  lastSeenLabel?: string;
}): PumpView {
  if (state === "unknown") {
    return {
      dotState: "unknown",
      dotOn: false,
      statusText: `Unknown — last seen ${lastSeenLabel}`,
      buttonLabel: "Control unavailable",
      disabled: true,
      reason:
        "Device hasn't reported recently — we can't verify or change the pump state right now.",
      showIndeterminate: false,
      showStaleBanner: true,
    };
  }

  if (state === "pending") {
    return {
      dotState: "pending",
      dotOn: false,
      statusText: relayOn ? "Turning off… (up to 5s)" : "Turning on… (up to 5s)",
      buttonLabel: "Sending command…",
      disabled: true,
      reason: "",
      showIndeterminate: true,
      showStaleBanner: false,
    };
  }

  // confirmed
  if (mode === "MANUAL") {
    return {
      dotState: "confirmed",
      dotOn: relayOn,
      statusText: relayOn ? "Pump on" : "Pump off",
      buttonLabel: "Control unavailable",
      disabled: true,
      reason:
        "The switch on the device is set to MANUAL — the pump can only be controlled on site until it's set back to AUTO.",
      showIndeterminate: false,
      showStaleBanner: false,
    };
  }

  return {
    dotState: "confirmed",
    dotOn: relayOn,
    statusText: relayOn ? "Pump on" : "Pump off",
    buttonLabel: relayOn ? "Turn off pump" : "Turn on pump",
    disabled: false,
    reason: "",
    showIndeterminate: false,
    showStaleBanner: false,
  };
}

export function PumpControl({
  state,
  mode,
  relayOn,
  lastSeenLabel,
  onToggle,
}: {
  state: DeviceState;
  mode: PumpMode;
  relayOn: boolean;
  lastSeenLabel?: string;
  onToggle?: () => void;
}) {
  const v = resolvePumpView({ state, mode, relayOn, lastSeenLabel });

  return (
    <div className="border-hair border-hairline rounded-card flex flex-col gap-3.5 bg-white p-5 sm:p-5.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-canopy font-semibold">Pump</span>
        <StatusPill tone="stone" size="sm">
          Mode: {mode}
        </StatusPill>
      </div>

      <div className="flex items-center gap-2.5">
        <StateDot state={v.dotState} on={v.dotOn} size={10} />
        <span
          className="font-mono text-lg text-canopy font-semibold sm:text-xl"
          aria-live="polite"
        >
          {v.statusText}
        </span>
      </div>

      {v.showIndeterminate && <IndeterminateBar />}

      <Button
        variant={v.disabled ? "disabled" : relayOn ? "primaryDark" : "primary"}
        size="block"
        disabled={v.disabled}
        onClick={onToggle}
        className="min-h-12"
      >
        {v.buttonLabel}
      </Button>

      {v.reason && (
        <div className="text-caption text-muted leading-normal">{v.reason}</div>
      )}
    </div>
  );
}
