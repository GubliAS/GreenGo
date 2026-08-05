import { db } from "./db";
import { dispatchAlertSms } from "./sms";
import type { AlertCondition } from "@prisma/client";

/* Alert evaluation with hysteresis: fires when a reading crosses BELOW
 * threshold, clears only once a later reading goes back ABOVE
 * clearThreshold (a higher bar), so a value hovering right at the boundary
 * cannot fire/clear repeatedly. Runs once per ingested reading, per enabled
 * rule on that device — called from the telemetry route.
 *
 * Per-condition cooldown prevents re-notifying while an alert is already
 * open: dispatchAlertSms is only called when a NEW Alert row is created
 * (firedAt), never on every reading while the condition persists.
 */

const CONDITION_LABEL: Record<AlertCondition, string> = {
  SOIL_BELOW: "soil moisture",
  TEMP_BELOW: "temperature (low)",
  TEMP_ABOVE: "temperature (high)",
  HUMIDITY_BELOW: "humidity (low)",
  HUMIDITY_ABOVE: "humidity (high)",
};

function isBelowCondition(condition: AlertCondition): boolean {
  return condition === "SOIL_BELOW" || condition === "TEMP_BELOW" || condition === "HUMIDITY_BELOW";
}

function valueForCondition(
  condition: AlertCondition,
  reading: { soilPct: number | null; tempC: number | null; humidityPct: number | null },
): number | null {
  switch (condition) {
    case "SOIL_BELOW":
      return reading.soilPct;
    case "TEMP_BELOW":
    case "TEMP_ABOVE":
      return reading.tempC;
    case "HUMIDITY_BELOW":
    case "HUMIDITY_ABOVE":
      return reading.humidityPct;
  }
}

export async function evaluateAlertsForReading({
  deviceId,
  tenantId,
  reading,
  now,
}: {
  deviceId: string;
  tenantId: string;
  reading: { soilPct: number | null; tempC: number | null; humidityPct: number | null };
  now: Date;
}) {
  const rules = await db.alertRule.findMany({ where: { deviceId, enabled: true } });

  for (const rule of rules) {
    const value = valueForCondition(rule.condition, reading);
    if (value === null) continue; // metric not reported this cycle (e.g. no calibration yet)

    const below = isBelowCondition(rule.condition);
    const isBad = below ? value < rule.threshold : value > rule.threshold;
    const isClear = below ? value >= rule.clearThreshold : value <= rule.clearThreshold;

    const openAlert = await db.alert.findFirst({
      where: { deviceId, ruleId: rule.id, clearedAt: null },
      orderBy: { firedAt: "desc" },
    });

    if (isBad && !openAlert) {
      // Cooldown: don't fire again within cooldownMinutes of the last time
      // THIS condition cleared, even if it re-crosses immediately.
      const lastCleared = await db.alert.findFirst({
        where: { deviceId, ruleId: rule.id, clearedAt: { not: null } },
        orderBy: { clearedAt: "desc" },
      });
      const cooldownActive =
        lastCleared?.clearedAt &&
        now.getTime() - lastCleared.clearedAt.getTime() < rule.cooldownMinutes * 60_000;

      const alert = await db.alert.create({
        data: {
          deviceId,
          tenantId,
          ruleId: rule.id,
          condition: rule.condition,
          value,
          firedAt: now,
          suppressedReason: cooldownActive ? "Cooldown active" : null,
        },
      });

      if (!cooldownActive) {
        const recipients = await db.smsRecipient.findMany({ where: { deviceId } });
        const critical = rule.condition === "SOIL_BELOW" && value < rule.threshold / 2;
        const body = `GreenGo: ${CONDITION_LABEL[rule.condition]} at ${value}${rule.condition === "SOIL_BELOW" || rule.condition.startsWith("HUMIDITY") ? "%" : "°C"}, ${
          critical ? "critically dry — " : ""
        }below your ${rule.threshold} threshold.`;

        for (const r of recipients) {
          const result = await dispatchAlertSms({
            tenantId,
            deviceId,
            alertId: alert.id,
            toPhoneE164: r.phoneE164,
            body,
            now,
          });
          if (result.sent) {
            await db.alert.update({ where: { id: alert.id }, data: { notifiedAt: now } });
          }
        }
      }
    } else if (isClear && openAlert) {
      await db.alert.update({ where: { id: openAlert.id }, data: { clearedAt: now } });
    }
  }
}
