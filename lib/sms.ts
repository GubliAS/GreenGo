import { db } from "./db";

/* SMS dispatch behind an interface with a console-logging stub — no live
 * provider for the demo, but no rewrite later. Swap getSmsSender()'s
 * implementation for a real provider (Twilio, Africa's Talking, etc.) by
 * adding a case here; every call site is unaffected. */

export interface SmsSender {
  send(input: { toPhoneE164: string; body: string }): Promise<{
    providerRef: string | null;
    costMinor: number;
    costCurrency: string;
  }>;
}

const COST_PER_SMS_MINOR = 20; // GHS 0.20, matching the handoff's SMS spend figures
const CURRENCY = "GHS";

class ConsoleSmsSender implements SmsSender {
  async send({ toPhoneE164, body }: { toPhoneE164: string; body: string }) {
    // eslint-disable-next-line no-console
    console.log(`[sms:console] → ${toPhoneE164}: ${body}`);
    return { providerRef: null, costMinor: COST_PER_SMS_MINOR, costCurrency: CURRENCY };
  }
}

let sender: SmsSender | null = null;

export function getSmsSender(): SmsSender {
  if (!sender) {
    // SMS_PROVIDER=console is the only implementation shipped with this demo
    // (.env.example). A real provider would branch on the same env var here.
    sender = new ConsoleSmsSender();
  }
  return sender;
}

/**
 * Sends (or records the suppression of) one alert SMS, applying the daily
 * cap and quiet-hours rules. Always writes an SmsMessage row — even
 * suppressed sends are worth a durable record, since "why didn't I get a
 * text" is a real support question.
 */
export async function dispatchAlertSms({
  tenantId,
  deviceId,
  alertId,
  toPhoneE164,
  body,
  now,
}: {
  tenantId: string;
  deviceId: string;
  alertId: string;
  toPhoneE164: string;
  body: string;
  now: Date;
}): Promise<{ sent: boolean; suppressedReason: string | null }> {
  const dailyCap = Number(process.env.DAILY_SMS_CAP ?? 10);
  const startOfDay = new Date(now);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const sentToday = await db.smsMessage.count({
    where: {
      tenantId,
      queuedAt: { gte: startOfDay },
      status: { in: ["QUEUED", "SENT", "DELIVERED"] },
    },
  });

  if (sentToday >= dailyCap) {
    await db.smsMessage.create({
      data: {
        tenantId,
        deviceId,
        alertId,
        toPhoneE164,
        body,
        status: "FAILED",
        failureReason: "Daily SMS cap reached",
        queuedAt: now,
      },
    });
    return { sent: false, suppressedReason: "Daily SMS cap reached" };
  }

  if (isQuietHours(now) && !isCriticalBody(body)) {
    await db.smsMessage.create({
      data: {
        tenantId,
        deviceId,
        alertId,
        toPhoneE164,
        body,
        status: "FAILED",
        failureReason: "Suppressed — quiet hours",
        queuedAt: now,
      },
    });
    return { sent: false, suppressedReason: "Suppressed — quiet hours" };
  }

  const result = await getSmsSender().send({ toPhoneE164, body });
  await db.smsMessage.create({
    data: {
      tenantId,
      deviceId,
      alertId,
      toPhoneE164,
      body,
      status: "DELIVERED",
      providerRef: result.providerRef,
      costMinor: result.costMinor,
      costCurrency: result.costCurrency,
      queuedAt: now,
      sentAt: now,
      deliveredAt: now,
    },
  });
  return { sent: true, suppressedReason: null };
}

/** Critically-dry soil overrides quiet hours — see AlertSettings in lib/types.ts. */
function isCriticalBody(body: string): boolean {
  return body.includes("critically dry");
}

/**
 * Fleet-wide quiet-hours default, sourced from env. The handoff's tenant
 * Alerts page designs a PER-DEVICE quiet-hours editor (9:00 PM-5:30 AM in
 * the mock), but the schema does not yet persist per-tenant overrides — this
 * is a deliberate scope cut, not an oversight. See DEVIATIONS.md.
 */
function isQuietHours(now: Date): boolean {
  const start = Number(process.env.QUIET_HOURS_START_HOUR ?? 21); // 9pm
  const end = Number(process.env.QUIET_HOURS_END_HOUR ?? 5.5); // 5:30am
  const hour = now.getUTCHours() + now.getUTCMinutes() / 60;
  if (start > end) {
    // window wraps midnight
    return hour >= start || hour < end;
  }
  return hour >= start && hour < end;
}
