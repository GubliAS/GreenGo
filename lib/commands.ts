import { db } from "./db";
import type { CommandAction, Device } from "@prisma/client";

/* Pump command lifecycle: issuance (user/admin action, called from Phase 4B's
 * pump-toggle route), delivery (device polls via POST /api/telemetry and
 * collects its oldest undelivered command), and confirmation (the device's
 * NEXT reported relay state proves the command took effect).
 *
 * The device can never be reached directly — this poll-response pattern IS
 * the entire remote-control mechanism. A command not collected within its TTL
 * is discarded, never delivered; see expireStaleCommands, called on every
 * telemetry post before a new command is selected. */

const PUMP_MAX_RUN_SECONDS = Number(process.env.PUMP_MAX_RUN_SECONDS ?? 150);
const PUMP_COOLDOWN_SECONDS = Number(process.env.PUMP_COOLDOWN_SECONDS ?? 300);
const PUMP_DAILY_RUNTIME_CAP_SECONDS = Number(process.env.PUMP_DAILY_RUNTIME_CAP_SECONDS ?? 3600);
const COMMAND_TTL_SECONDS = Number(process.env.COMMAND_TTL_SECONDS ?? 60);

export class ManualModeError extends Error {
  constructor() {
    super("Device is in MANUAL mode — remote commands are rejected until it's switched back to AUTO.");
    this.name = "ManualModeError";
  }
}
export class CooldownError extends Error {
  constructor(public retryAfterSeconds: number) {
    super(`Pump cooldown active — retry in ${retryAfterSeconds}s.`);
    this.name = "CooldownError";
  }
}
export class DailyCapError extends Error {
  constructor() {
    super("Daily pump runtime cap reached for this device.");
    this.name = "DailyCapError";
  }
}
export class DeviceDisabledError extends Error {
  constructor() {
    super("Device is disabled.");
    this.name = "DeviceDisabledError";
  }
}

export type CommandActor =
  | { kind: "AUTO" }
  | { kind: "USER" | "ADMIN"; userId: string; name: string };

/**
 * Issues a pump command, enforcing every server-side interlock regardless of
 * what the client requested. Throws a typed error (never a generic Error) so
 * callers can map each rejection to the right HTTP status and user-facing copy.
 */
export async function issuePumpCommand({
  device,
  tenantId,
  action,
  actor,
  now,
}: {
  device: Device;
  tenantId: string | null;
  action: CommandAction;
  actor: CommandActor;
  now: Date;
}) {
  if (device.disabled) throw new DeviceDisabledError();
  if (device.mode === "MANUAL") throw new ManualModeError();

  if (action === "PUMP_ON") {
    const lastOff = await db.command.findFirst({
      where: { deviceId: device.id, action: "PUMP_OFF", status: "CONFIRMED" },
      orderBy: { confirmedAt: "desc" },
    });
    if (lastOff?.confirmedAt) {
      const elapsed = (now.getTime() - lastOff.confirmedAt.getTime()) / 1000;
      if (elapsed < PUMP_COOLDOWN_SECONDS) {
        throw new CooldownError(Math.ceil(PUMP_COOLDOWN_SECONDS - elapsed));
      }
    }

    const startOfDay = new Date(now);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const todaysRuntime = await db.irrigationEvent.aggregate({
      where: { deviceId: device.id, startedAt: { gte: startOfDay } },
      _sum: { durationSeconds: true },
    });
    if ((todaysRuntime._sum.durationSeconds ?? 0) >= PUMP_DAILY_RUNTIME_CAP_SECONDS) {
      throw new DailyCapError();
    }
  }

  return db.command.create({
    data: {
      deviceId: device.id,
      tenantId,
      action,
      status: "PENDING",
      actorKind: actor.kind,
      actorUserId: actor.kind === "AUTO" ? null : actor.userId,
      actorName: actor.kind === "AUTO" ? "AUTO" : actor.name,
      maxRunSeconds: PUMP_MAX_RUN_SECONDS,
      expiresAt: new Date(now.getTime() + COMMAND_TTL_SECONDS * 1000),
    },
  });
}

/** Discards commands the device never collected in time. Never delivered. */
export async function expireStaleCommands(deviceId: string, now: Date) {
  await db.command.updateMany({
    where: { deviceId, status: "PENDING", expiresAt: { lt: now } },
    data: { status: "EXPIRED" },
  });
}

/** Returns the oldest still-valid pending command, marking it SENT. */
export async function collectPendingCommand(deviceId: string, now: Date) {
  const command = await db.command.findFirst({
    where: { deviceId, status: "PENDING", expiresAt: { gte: now } },
    orderBy: { createdAt: "asc" },
  });
  if (!command) return null;

  return db.command.update({
    where: { id: command.id },
    data: { status: "SENT", sentAt: now },
  });
}

/**
 * Called on every telemetry post. If the device's reported relay state
 * matches a SENT command's intent, that command is confirmed. Confirming a
 * PUMP_OFF closes out the matching IrrigationEvent.
 *
 * If the device reports MANUAL, any outstanding SENT command is failed
 * instead — the device is the source of truth for its own physical switch,
 * and a command queued before the switch flipped must not silently confirm.
 */
export async function reconcileSentCommand({
  device,
  relayOn,
  mode,
  now,
}: {
  device: Device;
  relayOn: boolean;
  mode: "AUTO" | "MANUAL";
  now: Date;
}) {
  const sent = await db.command.findFirst({
    where: { deviceId: device.id, status: "SENT" },
    orderBy: { sentAt: "desc" },
  });
  if (!sent) return;

  if (mode === "MANUAL") {
    await db.command.update({
      where: { id: sent.id },
      data: { status: "FAILED", stopReason: "Rejected — physical switch set to MANUAL" },
    });
    return;
  }

  const expectedRelayOn = sent.action === "PUMP_ON";
  if (relayOn !== expectedRelayOn) return; // not confirmed yet

  await db.command.update({
    where: { id: sent.id },
    data: { status: "CONFIRMED", confirmedAt: now },
  });

  if (sent.action === "PUMP_OFF") {
    const matchingOn = await db.command.findFirst({
      where: { deviceId: device.id, action: "PUMP_ON", status: "CONFIRMED", confirmedAt: { lt: sent.createdAt } },
      orderBy: { confirmedAt: "desc" },
    });
    if (matchingOn?.confirmedAt) {
      const durationSeconds = Math.round((now.getTime() - matchingOn.confirmedAt.getTime()) / 1000);
      await db.irrigationEvent.create({
        data: {
          deviceId: device.id,
          startedAt: matchingOn.confirmedAt,
          durationSeconds,
          trigger: matchingOn.actorKind === "AUTO" ? "AUTO" : "MANUAL",
          stopReason: sent.stopReason ?? `Stopped by ${sent.actorName}`,
        },
      });
    }
  }
}
