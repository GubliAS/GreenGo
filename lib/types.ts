/* ═══════════════════════════════════════════════════════════════════════════
   GreenGo domain types — the contracts every page codes against.
   Mirrors the Prisma schema built in Phase 3. Kept framework-free so both
   route handlers and client components can import them.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Device state vocabulary ─────────────────────────────────────────────
   The handoff is emphatic (README: "critical — do not simplify"): every
   pump/relay control and readout supports THREE states, never just on/off.

   confirmed — the device reported this. Solid dot, plain label.
   pending   — command sent, unacknowledged (~10s). Amber pulsing dot,
               indeterminate bar, control disabled.
   unknown   — device hasn't reported recently. Grey dot, no animation,
               control disabled WITH a stated reason, plus a page banner. */
export type DeviceState = "confirmed" | "pending" | "unknown";

/** Physical switch on the device. In MANUAL the switch has the final say and
 *  remote commands must be rejected server-side (DEV-003). */
export type PumpMode = "AUTO" | "MANUAL";

/** Lifecycle status shown in the admin devices list. The handoff's filter
 *  dropdown offers all six; only `online` and `unclaimed` have a designed
 *  row treatment (MANIFEST.md §D.2). */
export type DeviceStatus =
  | "online"
  | "offline"
  | "never_reported"
  | "unclaimed"
  | "disabled";

export type AdminRole = "super_admin" | "support";

/* ── Tenant ─────────────────────────────────────────────────────────────── */

export interface Tenant {
  id: string;
  name: string;
  /** E.164, normalised before any lookup. The login identifier is a phone
   *  number, never an email. */
  phoneE164: string;
  email: string | null;
  createdAt: string;
}

/* ── User ───────────────────────────────────────────────────────────────── */

export interface User {
  id: string;
  /** null for platform admins, who are not tenant-scoped. */
  tenantId: string | null;
  name: string;
  phoneE164: string;
  email: string | null;
  role: "tenant" | AdminRole;
  phoneVerifiedAt: string | null;
  createdAt: string;
}

/* ── Device ─────────────────────────────────────────────────────────────── */

export interface Device {
  id: string;
  /** Immutable hardware identity. Never reassigned. */
  mac: string;
  label: string | null;
  /** Human-readable public URL key (/devices/[slug]). */
  slug: string;
  /** null until a claim code is redeemed. Read from the session, never from a
   *  request parameter, for any tenant-scoped query. */
  tenantId: string | null;
  claimCode: string | null;
  claimedAt: string | null;
  firmware: string;
  status: DeviceStatus;
  lastSeenAt: string | null;
  /** Derived, not stored: lastSeenAt against the staleness threshold. */
  state: DeviceState;
  signalDbm: number | null;
  batteryV: number | null;
  uptimeSeconds: number | null;
  mode: PumpMode;
  relayOn: boolean;
  calibration: Calibration | null;
  createdAt: string;
}

/** The API key is stored hashed and is NEVER returned by any endpoint after
 *  provisioning — the handoff's Provision screen states this explicitly
 *  ("The API key is shown once"). Present only in the provisioning response. */
export interface ProvisionedDevice extends Device {
  apiKeyPlaintext: string;
}

/* ── Calibration ───────────────────────────────────────────────────────────
   Raw values are stored alongside percentages so a bad calibration is
   recoverable. An uncalibrated device makes soil readings meaningless — the
   admin Calibration tab warns prominently. */
export interface Calibration {
  id: string;
  deviceId: string;
  dryRaw: number;
  wetRaw: number;
  setByUserId: string | null;
  setByName: string | null;
  setAt: string;
}

/* ── Reading ────────────────────────────────────────────────────────────────
   Arrives every ~10 seconds. soilRaw is persisted as well as soilPct: raw
   values make calibration errors recoverable, percentages do not. */
export interface Reading {
  id: string;
  deviceId: string;
  recordedAt: string;
  /** Raw ADC value from the resistive bridge. Source of truth. */
  soilRaw: number;
  /** Derived from soilRaw against the device's calibration. null when the
   *  device has never been calibrated. */
  soilPct: number | null;
  tempC: number | null;
  humidityPct: number | null;
  /** Provisional on this hardware (an LDR). The metrics grid must degrade
   *  gracefully to 3 metrics when absent. */
  lightLux: number | null;
  relayOn: boolean;
  mode: PumpMode;
  signalDbm: number | null;
  batteryV: number | null;
}

/** Exactly what the ESP32 POSTs to /api/telemetry. */
export interface TelemetryPayload {
  soilRaw: number;
  /** Optional — when present, preferred over server-side calibration mapping.
   *  Lets capacitive firmware report the same % shown on the LCD. */
  soilPct?: number;
  tempC?: number;
  humidityPct?: number;
  /** Provisional on this hardware (an LDR). Stored as 0–100 percent for the
   *  current board; the dashboard labels it "%", not lux. */
  lightLux?: number;
  relayOn: boolean;
  mode: PumpMode;
  signalDbm?: number;
  batteryV?: number;
}

/** The response body is the entire remote-control mechanism: the server can
 *  never reach the device, so the device collects commands on check-in. */
export interface TelemetryResponse {
  ok: true;
  readingId: string;
  /** null when nothing is queued, or when the queued command expired before
   *  the device checked in — expired commands are discarded, never delivered. */
  command: PendingCommand | null;
}

export interface PendingCommand {
  id: string;
  action: CommandAction;
  /** Hard ceiling the device enforces locally as a failsafe. */
  maxRunSeconds: number;
}

/* ── Command ────────────────────────────────────────────────────────────── */

export type CommandAction = "pump_on" | "pump_off";

export type CommandStatus =
  | "pending"
  | "sent"
  | "confirmed"
  | "failed"
  | "expired";

/** Who initiated it. AUTO is the device's own threshold logic. */
export type CommandActor =
  | { kind: "auto" }
  | { kind: "user"; userId: string; name: string }
  | { kind: "admin"; userId: string; name: string };

export interface Command {
  id: string;
  deviceId: string;
  tenantId: string | null;
  action: CommandAction;
  status: CommandStatus;
  actor: CommandActor;
  maxRunSeconds: number;
  /** Past this instant the command is discarded rather than delivered. */
  expiresAt: string;
  createdAt: string;
  sentAt: string | null;
  confirmedAt: string | null;
  /** Free text shown in the Irrigation Log's "Stop reason" column, e.g.
   *  "Soil reached 70% — target saturation", "Stopped by user from dashboard",
   *  "Stopped — physical switch set to MANUAL". */
  stopReason: string | null;
}

/** One completed irrigation event, as the Irrigation Log renders it. */
export interface IrrigationEvent {
  id: string;
  deviceId: string;
  startedAt: string;
  durationSeconds: number;
  trigger: "AUTO" | "MANUAL";
  stopReason: string;
}

/* ── Alerts ─────────────────────────────────────────────────────────────── */

export type AlertCondition =
  | "soil_below"
  | "temp_below"
  | "temp_above"
  | "humidity_below"
  | "humidity_above";

/** Thresholds fire below a value and clear only above a HIGHER one, so a
 *  reading hovering on the boundary cannot flap. */
export interface AlertRule {
  id: string;
  deviceId: string;
  tenantId: string;
  condition: AlertCondition;
  /** Fires when crossed. */
  threshold: number;
  /** Clears only when crossed back past this — the hysteresis gap. */
  clearThreshold: number;
  /** Minimum gap between repeat notifications for this condition. */
  cooldownMinutes: number;
  enabled: boolean;
}

export interface Alert {
  id: string;
  deviceId: string;
  tenantId: string;
  ruleId: string;
  condition: AlertCondition;
  /** The reading that fired it. */
  value: number;
  firedAt: string;
  clearedAt: string | null;
  notifiedAt: string | null;
  /** Set when the alert fired but no SMS was sent, e.g. "quiet hours",
   *  "daily cap reached", "cooldown active". */
  suppressedReason: string | null;
}

/** Per-tenant notification preferences, as the Alerts screen edits them. */
export interface AlertSettings {
  tenantId: string;
  deviceId: string;
  soilBelowPct: number;
  tempMinC: number;
  tempMaxC: number;
  humidityMinPct: number;
  humidityMaxPct: number;
  recipients: SmsRecipient[];
  quietHoursStart: string;
  quietHoursEnd: string;
  /** Critically-dry soil overrides quiet hours. */
  quietHoursOverrideOnCritical: boolean;
  dailySmsCap: number;
}

export interface SmsRecipient {
  id: string;
  phoneE164: string;
  isPrimary: boolean;
}

/* ── SMS ────────────────────────────────────────────────────────────────── */

export type SmsStatus = "queued" | "sent" | "delivered" | "failed" | "undelivered";

export interface SmsMessage {
  id: string;
  tenantId: string | null;
  deviceId: string | null;
  alertId: string | null;
  toPhoneE164: string;
  body: string;
  status: SmsStatus;
  /** Provider's identifier, null for the console stub. */
  providerRef: string | null;
  failureReason: string | null;
  costMinor: number | null;
  costCurrency: string;
  queuedAt: string;
  sentAt: string | null;
  deliveredAt: string | null;
}

/* ── Claim codes ────────────────────────────────────────────────────────────
   Single use, marked consumed atomically. The four states below are the ones
   the handoff designs feedback for on the Login and Add Device screens. */
export type ClaimCodeState = "valid" | "claimed" | "expired" | "invalid";

export interface ClaimCode {
  id: string;
  code: string;
  deviceId: string;
  expiresAt: string | null;
  consumedAt: string | null;
  consumedByTenantId: string | null;
  createdAt: string;
}

/* ── Audit ──────────────────────────────────────────────────────────────── */

export type AuditAction =
  | "login_success"
  | "login_failure"
  | "logout"
  | "device_provisioned"
  | "device_claimed"
  | "device_unclaimed"
  | "device_viewed"
  | "api_key_regenerated"
  | "command_issued"
  | "calibration_set"
  | "alert_rules_updated"
  | "password_changed";

export interface AuditEntry {
  id: string;
  actorUserId: string | null;
  actorName: string;
  tenantId: string | null;
  deviceId: string | null;
  action: AuditAction;
  details: string;
  ip: string | null;
  createdAt: string;
}

/* ── View models used by shared components ─────────────────────────────── */

/** One segment of the signature moisture bar. See lib/moisture.ts. */
export interface Segment {
  index: number;
  filled: boolean;
  /** CSS colour for a filled segment; null when empty. */
  color: string | null;
}

export interface FleetCounts {
  total: number;
  online: number;
  offline: number;
  neverReported: number;
  unclaimed: number;
  alerting: number;
}
