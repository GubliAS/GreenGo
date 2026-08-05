import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import argon2 from "argon2";

/* Phase 3 seed. Not a trivial fixture — the brief is explicit that a working
 * demo depends on this: "Empty charts make a working system look broken."
 *
 * Generates 10 days of plausible 10-second telemetry for one device:
 *   - a diurnal temperature curve (low ~2am, peak ~2pm)
 *   - humidity inversely tracking temperature
 *   - soil moisture declining gradually, stepping up at each irrigation event
 *   - matching Command + IrrigationEvent + Alert rows at each threshold cross
 *   - one MANUAL-mode window, so that state isn't purely theoretical
 *
 * Also seeds: one admin (super_admin), one tenant with one claimed device,
 * one unclaimed device with an active claim code, a consumed and an expired
 * claim code (matching the four ClaimCodeField states the UI already
 * demos), and a handful of SMS messages with mixed delivery statuses.
 */

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const DAYS = 10;
const INTERVAL_SECONDS = 10;
const READINGS_PER_DAY = (24 * 60 * 60) / INTERVAL_SECONDS; // 8,640
const TOTAL_READINGS = DAYS * READINGS_PER_DAY; // 86,400

const DRY_RAW = 612;
const WET_RAW = 198;

// Dates are pinned (not Date.now()) so the seed is reproducible.
const NOW = new Date("2026-08-05T09:00:00Z");
const START = new Date(NOW.getTime() - DAYS * 24 * 60 * 60 * 1000);

function pctToRaw(pct: number): number {
  // Inverse of soilRawToPercent: pct = (dry - raw) / (dry - wet) * 100
  return Math.round(DRY_RAW - (pct / 100) * (DRY_RAW - WET_RAW));
}

/** Diurnal temperature: low ~24°C at 2am, high ~30°C at 2pm, plus jitter. */
function tempAt(hourOfDay: number, jitter: number): number {
  const base = 27 + 3 * Math.sin(((hourOfDay - 8) / 24) * 2 * Math.PI);
  return Math.round((base + jitter) * 10) / 10;
}

/** Humidity inversely tracks temperature. */
function humidityAt(temp: number, jitter: number): number {
  const h = 82 - (temp - 24) * 3.2 + jitter;
  return Math.max(35, Math.min(95, Math.round(h)));
}

type SoilPoint = { pct: number; relayOn: boolean; mode: "AUTO" | "MANUAL" };
type Cycle = {
  startIndex: number;
  endIndex: number;
  trigger: "AUTO" | "MANUAL";
  stopReason: string;
  failed: boolean;
};

/**
 * Builds the full soil-moisture timeline and returns both the per-reading
 * points and the list of irrigation cycles (for Command/IrrigationEvent/Alert
 * rows). Soil declines ~1.6%/hour; an AUTO cycle fires when it crosses 30%,
 * running 4-6 minutes (matching the handoff mock's own event durations) and
 * raising soil to a random 68-92% target — duration and target are chosen
 * together and interpolated linearly, so both the "reached N%" copy and the
 * elapsed time stay consistent with each other.
 *
 * After the 4th confirmed cycle, MANUAL is engaged and stays on until the
 * NEXT threshold-cross — whenever that naturally occurs — so exactly one
 * rejected cycle is guaranteed regardless of the randomised cycle timing.
 * An earlier version used a fixed-duration MANUAL window keyed to a fixed
 * reading index; because cycle spacing is itself randomised, that window
 * missed the trigger entirely in testing (0 failed cycles across every
 * run) — caught by simulating the pure function before running it against
 * 86,400 rows in a database.
 */
function buildSoilTimeline() {
  const points: SoilPoint[] = new Array(TOTAL_READINGS);
  const cycles: Cycle[] = [];

  let pct = 82;
  let mode: "AUTO" | "MANUAL" = "AUTO";
  let relayOn = false;
  let cycleEnd = -1;
  let cycleStartIndex = 0;
  let cycleStartPct = 0;
  let cycleTargetPct = 0;
  let confirmedCount = 0;
  let manualInjected = false;

  const DECLINE_PER_TICK = 1.6 / 360; // ~1.6%/hour

  for (let i = 0; i < TOTAL_READINGS; i++) {
    if (i < cycleEnd) {
      relayOn = true;
      const frac = (i - cycleStartIndex) / (cycleEnd - cycleStartIndex);
      pct = cycleStartPct + (cycleTargetPct - cycleStartPct) * frac;
    } else {
      relayOn = false;
      pct = Math.max(4, pct - DECLINE_PER_TICK);

      const cooldownOk = i >= (cycles.at(-1)?.endIndex ?? -1) + 100;
      const shouldTrigger = pct <= 30 && cooldownOk;

      if (shouldTrigger) {
        if (mode === "MANUAL") {
          cycles.push({
            startIndex: i,
            endIndex: i,
            trigger: "MANUAL",
            stopReason: "Rejected — physical switch set to MANUAL",
            failed: true,
          });
          mode = "AUTO"; // exactly one rejection, then resume normal service
        } else {
          const duration = 24 + Math.round(Math.random() * 12); // 4-6 min
          const target = 68 + Math.round(Math.random() * 24); // 68-92%
          cycleStartIndex = i;
          cycleStartPct = pct;
          cycleTargetPct = target;
          cycleEnd = i + duration;
          cycles.push({
            startIndex: i,
            endIndex: cycleEnd,
            trigger: "AUTO",
            stopReason: `Soil reached ${target}% — target saturation`,
            failed: false,
          });
          confirmedCount++;
          if (confirmedCount === 4 && !manualInjected) {
            mode = "MANUAL";
            manualInjected = true;
          }
        }
      }
    }

    points[i] = { pct: Math.round(pct), relayOn, mode };
  }

  return { points, cycles };
}

async function main() {
  console.log(`Seeding ${TOTAL_READINGS.toLocaleString()} readings over ${DAYS} days...`);

  await db.smsMessage.deleteMany();
  await db.alert.deleteMany();
  await db.alertRule.deleteMany();
  await db.irrigationEvent.deleteMany();
  await db.command.deleteMany();
  await db.reading.deleteMany();
  await db.calibration.deleteMany();
  await db.claimCode.deleteMany();
  await db.auditEntry.deleteMany();
  await db.smsRecipient.deleteMany();
  await db.device.deleteMany();
  await db.user.deleteMany();
  await db.tenant.deleteMany();

  // ── Admin ────────────────────────────────────────────────────────────
  const adminPasswordHash = await argon2.hash("dev-admin-password", { type: argon2.argon2id });
  const admin = await db.user.create({
    data: {
      name: "Owusu Prempeh",
      phoneE164: "+233541000001",
      email: "ops@greengo.dev",
      passwordHash: adminPasswordHash,
      role: "SUPER_ADMIN",
      phoneVerifiedAt: NOW,
    },
  });

  // ── Tenant + claimed device ──────────────────────────────────────────
  const tenantPasswordHash = await argon2.hash("dev-tenant-password", { type: argon2.argon2id });
  const tenant = await db.tenant.create({
    data: {
      name: "Kwame Asante",
      phoneE164: "+233241234501",
      email: "kwame@farm.com",
      createdAt: new Date(START.getTime() - 50 * 24 * 60 * 60 * 1000),
    },
  });
  const kwame = await db.user.create({
    data: {
      tenantId: tenant.id,
      name: "Kwame Asante",
      phoneE164: tenant.phoneE164,
      email: tenant.email,
      passwordHash: tenantPasswordHash,
      role: "TENANT",
      phoneVerifiedAt: tenant.createdAt,
    },
  });

  const deviceApiKeyHash = await argon2.hash("ggk_4f9a2c8b1e6d3f7a2c8b1e6d3f2a", {
    type: argon2.argon2id,
  });
  const device = await db.device.create({
    data: {
      mac: "A4:CF:12:8E:3B:01",
      label: "Greenhouse 1",
      tenantId: tenant.id,
      apiKeyHash: deviceApiKeyHash,
      firmware: "v1.4.2",
      claimedAt: tenant.createdAt,
      createdAt: new Date(tenant.createdAt.getTime() - 1000),
      lastSeenAt: NOW,
      signalDbm: -62,
      batteryV: 3.9,
      uptimeSeconds: 46 * 24 * 3600 + 3 * 3600,
      mode: "AUTO",
      relayOn: false,
    },
  });

  await db.calibration.create({
    data: {
      deviceId: device.id,
      dryRaw: DRY_RAW,
      wetRaw: WET_RAW,
      setByUserId: kwame.id,
      setAt: tenant.createdAt,
    },
  });

  await db.smsRecipient.createMany({
    data: [
      { deviceId: device.id, phoneE164: tenant.phoneE164, isPrimary: true },
      { deviceId: device.id, phoneE164: "+233201234545", isPrimary: false },
    ],
  });

  const alertRule = await db.alertRule.create({
    data: {
      deviceId: device.id,
      tenantId: tenant.id,
      condition: "SOIL_BELOW",
      threshold: 30,
      clearThreshold: 40,
      cooldownMinutes: 60,
      enabled: true,
    },
  });

  // ── Unclaimed device + claim codes (matching the 4 UI-demoed states) ──
  const unclaimedApiKeyHash = await argon2.hash("ggk_e3f7a2c8b1d6e4f9a2c8b1e6d3f7a2c8", {
    type: argon2.argon2id,
  });
  const unclaimedDevice = await db.device.create({
    data: {
      mac: "A4:CF:12:8E:3B:02",
      apiKeyHash: unclaimedApiKeyHash,
      firmware: "v1.4.2",
      createdAt: new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await db.claimCode.create({
    data: { code: "GG-4F82-K1", deviceId: device.id, consumedAt: tenant.createdAt, consumedByTenantId: tenant.id },
  });
  await db.claimCode.create({
    data: { code: "GG-9K21-P4", deviceId: unclaimedDevice.id, expiresAt: new Date(NOW.getTime() + 30 * 24 * 3600 * 1000) },
  });
  // GG-1111-11 / GG-2222-22 need a device FK too — model a spare unclaimed
  // unit for each so "claimed by another account" / "expired" are real rows,
  // not just UI copy.
  const spareA = await db.device.create({
    data: {
      mac: "A4:CF:12:8E:3B:03",
      apiKeyHash: await argon2.hash("spare-a", { type: argon2.argon2id }),
      firmware: "v1.4.2",
    },
  });
  const otherTenant = await db.tenant.create({
    data: { name: "Ama Owusu", phoneE164: "+233551234567", createdAt: START },
  });
  await db.claimCode.create({
    data: { code: "GG-1111-11", deviceId: spareA.id, consumedAt: START, consumedByTenantId: otherTenant.id },
  });
  const spareB = await db.device.create({
    data: {
      mac: "A4:CF:12:8E:3B:04",
      apiKeyHash: await argon2.hash("spare-b", { type: argon2.argon2id }),
      firmware: "v1.4.2",
    },
  });
  await db.claimCode.create({
    data: { code: "GG-2222-22", deviceId: spareB.id, expiresAt: new Date(START.getTime() + 24 * 3600 * 1000) },
  });

  // ── Telemetry ──────────────────────────────────────────────────────────
  const { points, cycles } = buildSoilTimeline();

  const BATCH = 2000;
  let batch: {
    deviceId: string;
    recordedAt: Date;
    soilRaw: number;
    soilPct: number;
    tempC: number;
    humidityPct: number;
    lightLux: number | null;
    relayOn: boolean;
    mode: "AUTO" | "MANUAL";
    signalDbm: number;
    batteryV: number;
  }[] = [];

  for (let i = 0; i < TOTAL_READINGS; i++) {
    const recordedAt = new Date(START.getTime() + i * INTERVAL_SECONDS * 1000);
    const hourOfDay = recordedAt.getUTCHours() + recordedAt.getUTCMinutes() / 60;
    const jitterT = (Math.sin(i / 37) + Math.sin(i / 11)) * 0.4;
    const temp = tempAt(hourOfDay, jitterT);
    const humidity = humidityAt(temp, (Math.sin(i / 53) + Math.sin(i / 19)) * 3);
    const point = points[i]!;
    // Battery declines slowly over 10 days: 4.1V -> 3.7V, plus tiny ripple.
    const batteryV = Math.round((4.1 - (i / TOTAL_READINGS) * 0.4 + Math.sin(i / 500) * 0.02) * 100) / 100;
    const signalDbm = -60 - Math.round(Math.abs(Math.sin(i / 211)) * 8);

    batch.push({
      deviceId: device.id,
      recordedAt,
      soilRaw: pctToRaw(point.pct),
      soilPct: point.pct,
      tempC: temp,
      humidityPct: humidity,
      lightLux: null, // provisional sensor — this device runs without it
      relayOn: point.relayOn,
      mode: point.mode,
      signalDbm,
      batteryV,
    });

    if (batch.length === BATCH || i === TOTAL_READINGS - 1) {
      await db.reading.createMany({ data: batch });
      batch = [];
      if (i % (BATCH * 10) === 0) {
        console.log(`  ${i.toLocaleString()} / ${TOTAL_READINGS.toLocaleString()} readings`);
      }
    }
  }

  // ── Commands, irrigation events, and alerts for each cycle ────────────
  let lastAlertClearedIndex = -1;
  for (const cycle of cycles) {
    const startAt = new Date(START.getTime() + cycle.startIndex * INTERVAL_SECONDS * 1000);

    if (cycle.failed) {
      await db.command.create({
        data: {
          deviceId: device.id,
          tenantId: tenant.id,
          action: "PUMP_ON",
          status: "FAILED",
          actorKind: "AUTO",
          actorName: "AUTO",
          maxRunSeconds: 600,
          expiresAt: new Date(startAt.getTime() + 60_000),
          createdAt: startAt,
          stopReason: cycle.stopReason,
        },
      });
      continue;
    }

    const endAt = new Date(START.getTime() + cycle.endIndex * INTERVAL_SECONDS * 1000);
    const durationSeconds = (cycle.endIndex - cycle.startIndex) * INTERVAL_SECONDS;

    await db.command.create({
      data: {
        deviceId: device.id,
        tenantId: tenant.id,
        action: "PUMP_ON",
        status: "CONFIRMED",
        actorKind: "AUTO",
        actorName: "AUTO",
        maxRunSeconds: 600,
        expiresAt: new Date(startAt.getTime() + 60_000),
        createdAt: startAt,
        sentAt: startAt,
        confirmedAt: startAt,
      },
    });
    await db.command.create({
      data: {
        deviceId: device.id,
        tenantId: tenant.id,
        action: "PUMP_OFF",
        status: "CONFIRMED",
        actorKind: "AUTO",
        actorName: "AUTO",
        maxRunSeconds: 600,
        expiresAt: new Date(endAt.getTime() + 60_000),
        createdAt: endAt,
        sentAt: endAt,
        confirmedAt: endAt,
        stopReason: cycle.stopReason,
      },
    });

    await db.irrigationEvent.create({
      data: {
        deviceId: device.id,
        startedAt: startAt,
        durationSeconds,
        trigger: "AUTO",
        stopReason: cycle.stopReason,
      },
    });

    // One alert per cycle: fired when soil crossed the threshold just before
    // the cycle started, cleared once the cycle brought it back up.
    if (cycle.startIndex > lastAlertClearedIndex) {
      const alert = await db.alert.create({
        data: {
          deviceId: device.id,
          tenantId: tenant.id,
          ruleId: alertRule.id,
          condition: "SOIL_BELOW",
          value: points[cycle.startIndex]!.pct,
          firedAt: startAt,
          clearedAt: endAt,
          notifiedAt: startAt,
        },
      });
      await db.smsMessage.create({
        data: {
          tenantId: tenant.id,
          deviceId: device.id,
          alertId: alert.id,
          toPhoneE164: tenant.phoneE164,
          body: `GreenGo: soil at ${points[cycle.startIndex]!.pct}%, below your 30% threshold.`,
          status: "DELIVERED",
          costMinor: 20,
          costCurrency: "GHS",
          queuedAt: startAt,
          sentAt: startAt,
          deliveredAt: new Date(startAt.getTime() + 4000),
        },
      });
      lastAlertClearedIndex = cycle.endIndex;
    }
  }

  // One deliberately failed SMS, for the mixed-status requirement.
  await db.smsMessage.create({
    data: {
      tenantId: tenant.id,
      deviceId: device.id,
      toPhoneE164: "+233201234545",
      body: "GreenGo: verification code 4821.",
      status: "FAILED",
      failureReason: "Undeliverable — invalid number",
      costMinor: 0,
      costCurrency: "GHS",
      queuedAt: new Date(NOW.getTime() - 3 * 24 * 3600 * 1000),
    },
  });

  // ── Audit log ──────────────────────────────────────────────────────────
  await db.auditEntry.createMany({
    data: [
      {
        actorUserId: kwame.id,
        actorName: kwame.name,
        tenantId: tenant.id,
        deviceId: device.id,
        action: "DEVICE_CLAIMED",
        details: `claimed device GG-4F82-K1 as "Greenhouse 1"`,
        createdAt: tenant.createdAt,
      },
      {
        actorUserId: admin.id,
        actorName: admin.name,
        deviceId: device.id,
        action: "DEVICE_PROVISIONED",
        details: "Claim code GG-4F82-K1 generated for A4:CF:12:8E:3B:01",
        createdAt: new Date(tenant.createdAt.getTime() - 1000),
      },
      {
        actorUserId: admin.id,
        actorName: admin.name,
        action: "LOGIN_SUCCESS",
        details: "From 102.184.XX.XX",
        ip: "102.184.10.20",
        createdAt: new Date(NOW.getTime() - 3 * 24 * 3600 * 1000),
      },
      {
        actorUserId: admin.id,
        actorName: admin.name,
        deviceId: device.id,
        action: "DEVICE_VIEWED",
        details: "Greenhouse 1 (A4:CF:12:8E:3B:01)",
        createdAt: NOW,
      },
      {
        actorName: "Unknown",
        action: "LOGIN_FAILURE",
        details: "Failed login attempt for +233 24 XXX XX01",
        createdAt: new Date(NOW.getTime() - 3 * 24 * 3600 * 1000 + 3600 * 1000),
      },
    ],
  });

  console.log("Seed complete:");
  console.log(`  ${TOTAL_READINGS.toLocaleString()} readings`);
  console.log(`  ${cycles.filter((c) => !c.failed).length} irrigation cycles`);
  console.log(`  ${cycles.filter((c) => c.failed).length} rejected (MANUAL) cycles`);
  console.log(`  admin login: ${admin.phoneE164} / ops@greengo.dev · password: dev-admin-password`);
  console.log(`  tenant login: ${tenant.phoneE164} · password: dev-tenant-password`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
