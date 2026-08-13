import type { AlertCondition, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

/* Ensures a claimed device has the alert rules + primary SMS recipient the
 * Alerts page and /api/telemetry alert evaluator expect. Safe to call on
 * every alerts page load (upserts only create missing rows). */

const DEFAULT_RULES: {
  condition: AlertCondition;
  threshold: number;
  clearThreshold: number;
}[] = [
  { condition: "SOIL_BELOW", threshold: 30, clearThreshold: 40 },
  { condition: "TEMP_BELOW", threshold: 18, clearThreshold: 20 },
  { condition: "TEMP_ABOVE", threshold: 32, clearThreshold: 30 },
  { condition: "HUMIDITY_BELOW", threshold: 40, clearThreshold: 45 },
  { condition: "HUMIDITY_ABOVE", threshold: 85, clearThreshold: 80 },
];

type Tx = Prisma.TransactionClient;

export async function ensureDeviceAlertSetup(
  deviceId: string,
  tenantId: string,
  tx: Tx | typeof db = db,
) {
  const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });

  if (tenant?.phoneE164) {
    const primary = await tx.smsRecipient.findFirst({
      where: { deviceId, isPrimary: true },
    });
    if (!primary) {
      const existingPhone = await tx.smsRecipient.findFirst({
        where: { deviceId, phoneE164: tenant.phoneE164 },
      });
      if (existingPhone) {
        await tx.smsRecipient.update({
          where: { id: existingPhone.id },
          data: { isPrimary: true },
        });
      } else {
        await tx.smsRecipient.create({
          data: { deviceId, phoneE164: tenant.phoneE164, isPrimary: true },
        });
      }
    }
  }

  for (const rule of DEFAULT_RULES) {
    await tx.alertRule.upsert({
      where: {
        deviceId_condition: { deviceId, condition: rule.condition },
      },
      create: {
        deviceId,
        tenantId,
        condition: rule.condition,
        threshold: rule.threshold,
        clearThreshold: rule.clearThreshold,
        cooldownMinutes: Number(process.env.ALERT_COOLDOWN_MINUTES ?? 60),
        enabled: true,
      },
      update: {},
    });
  }
}
