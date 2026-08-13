import type { Metadata } from "next";
import { AppTopBar } from "@/components/nav/AppTopBar";
import { Card, CardTitle, PageTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { InlineHint } from "@/components/ui/Feedback";
import { db, requireTenantId } from "@/lib/db";
import { getSession } from "@/lib/session";
import { resolveTenantDeviceForSubpath } from "@/lib/device-route";
import { ensureDeviceAlertSetup } from "@/lib/device-defaults";
import { formatPhoneDisplay, formatQuietHourLabel } from "@/lib/format";
import type { AlertCondition } from "@prisma/client";

/* Alerts & thresholds → /devices/[slug]/alerts · source: GreenGo Alerts.dc.html
 * Spec: handoff/tenant.md §4.
 *
 * Thresholds + recipients are loaded from AlertRule / SmsRecipient. Quiet
 * hours are fleet-wide env (not persisted per device — see DEVIATIONS.md).
 * Save is not wired to a write endpoint yet (same scope cut as Settings). */

export const metadata: Metadata = { title: "Alerts & thresholds — GreenGo" };
export const dynamic = "force-dynamic";

const numberField =
  "border-hair border-line rounded-input box-border w-full bg-white px-3 py-2.75 text-base font-mono";
const timeField =
  "border-hair border-line rounded-input box-border w-27.5 bg-white px-3 py-2.75 text-base";

function ruleValue(
  rules: { condition: AlertCondition; threshold: number }[],
  condition: AlertCondition,
  fallback: number,
): number {
  return rules.find((r) => r.condition === condition)?.threshold ?? fallback;
}

export default async function AlertsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();
  const tenantId = requireTenantId(session?.kind === "tenant" ? session : null);
  const device = await resolveTenantDeviceForSubpath(slug, tenantId, "alerts");
  const title = device.label ?? device.mac;

  await ensureDeviceAlertSetup(device.id, tenantId);

  const [rules, recipients] = await Promise.all([
    db.alertRule.findMany({ where: { deviceId: device.id } }),
    db.smsRecipient.findMany({
      where: { deviceId: device.id },
      orderBy: [{ isPrimary: "desc" }, { phoneE164: "asc" }],
    }),
  ]);

  const soilBelow = ruleValue(rules, "SOIL_BELOW", 30);
  const tempMin = ruleValue(rules, "TEMP_BELOW", 18);
  const tempMax = ruleValue(rules, "TEMP_ABOVE", 32);
  const humidityMin = ruleValue(rules, "HUMIDITY_BELOW", 40);
  const humidityMax = ruleValue(rules, "HUMIDITY_ABOVE", 85);

  const quietStart = formatQuietHourLabel(
    Number(process.env.QUIET_HOURS_START_HOUR ?? 21),
  );
  const quietEnd = formatQuietHourLabel(Number(process.env.QUIET_HOURS_END_HOUR ?? 5.5));

  return (
    <div className="min-h-screen">
      <AppTopBar active="alerts" deviceSlug={device.slug} />
      <div className="p-page max-w-form-wide mx-auto flex flex-col gap-4.5">
        <PageTitle>Alerts &amp; thresholds — {title}</PageTitle>

        <Card className="flex flex-col gap-4.5">
          <CardTitle>Soil moisture</CardTitle>
          <div>
            <label
              htmlFor="soil-threshold"
              className="text-meta text-canopy mb-1.5 block font-semibold"
            >
              Alert when soil drops below
            </label>
            <div className="flex items-center gap-2.5">
              <input
                id="soil-threshold"
                type="text"
                readOnly
                defaultValue={String(soilBelow)}
                className={`${numberField} w-20`}
              />
              <span className="text-base text-muted">%</span>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col gap-4.5">
          <CardTitle>Temperature &amp; humidity bands</CardTitle>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(180px,100%),1fr))] gap-4">
            <div>
              <label className="text-meta text-canopy mb-1.5 block font-semibold">
                Temp min / max (°C)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  defaultValue={String(tempMin)}
                  className={numberField}
                  aria-label="Temperature minimum"
                />
                <input
                  type="text"
                  readOnly
                  defaultValue={String(tempMax)}
                  className={numberField}
                  aria-label="Temperature maximum"
                />
              </div>
            </div>
            <div>
              <label className="text-meta text-canopy mb-1.5 block font-semibold">
                Humidity min / max (%)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  defaultValue={String(humidityMin)}
                  className={numberField}
                  aria-label="Humidity minimum"
                />
                <input
                  type="text"
                  readOnly
                  defaultValue={String(humidityMax)}
                  className={numberField}
                  aria-label="Humidity maximum"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col gap-3.5">
          <CardTitle>SMS recipients</CardTitle>
          {recipients.length === 0 ? (
            <InlineHint>
              No SMS recipients on this device yet. The account phone is added
              automatically when thresholds are first set up.
            </InlineHint>
          ) : (
            <div className="flex flex-col gap-2.5">
              {recipients.map((r) => (
                <div
                  key={r.id}
                  className="bg-app rounded-tile flex items-center justify-between px-3.5 py-2.5"
                >
                  <span className="text-body text-canopy">
                    {formatPhoneDisplay(r.phoneE164)}
                    {r.isPrimary ? " (you)" : ""}
                  </span>
                  {r.isPrimary ? (
                    <span className="text-caption text-muted">Primary</span>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="flex flex-col gap-3.5">
          <CardTitle>Quiet hours</CardTitle>
          <p className="text-sm text-muted m-0">
            No SMS sent in this window, unless soil is critically dry. Fleet-wide
            default (not editable per device yet).
          </p>
          <div className="flex items-center gap-3">
            <input type="text" readOnly defaultValue={quietStart} className={timeField} />
            <span className="text-sm text-muted">to</span>
            <input type="text" readOnly defaultValue={quietEnd} className={timeField} />
          </div>
        </Card>

        <div className="flex flex-col gap-2">
          <Button variant="primary" size="md" className="self-start" disabled>
            Save thresholds
          </Button>
          <InlineHint>
            Threshold editing from this screen is not wired yet — values above
            are the live rules used for SMS alerts.
          </InlineHint>
        </div>
      </div>
    </div>
  );
}
