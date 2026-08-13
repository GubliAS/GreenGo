import type { Metadata } from "next";
import { AppTopBar } from "@/components/nav/AppTopBar";
import { NotificationsInbox, type NotificationItem } from "@/components/device/NotificationsInbox";
import { db, requireTenantId } from "@/lib/db";
import { getSession } from "@/lib/session";
import { formatRelativeAgo, formatWhen } from "@/lib/format";

/* /notifications — DEV-005. Built from Alert + Command rows for this tenant. */

export const metadata: Metadata = { title: "Notifications — GreenGo" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await getSession();
  const tenantId = requireTenantId(session?.kind === "tenant" ? session : null);

  const [alerts, commands] = await Promise.all([
    db.alert.findMany({
      where: { tenantId },
      include: { device: true, rule: true },
      orderBy: { firedAt: "desc" },
      take: 40,
    }),
    db.command.findMany({
      where: { tenantId },
      include: { device: true },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
  ]);

  const items: NotificationItem[] = [];

  for (const a of alerts) {
    const label = a.device.label ?? a.device.mac;
    const unit =
      a.condition === "SOIL_BELOW" || a.condition.startsWith("HUMIDITY") ? "%" : "°C";
    items.push({
      id: `alert-${a.id}`,
      kind: "alert",
      text: `${conditionLabel(a.condition)} — ${a.value}${unit} (threshold ${a.rule.threshold}${unit}) on ${label}`,
      time: formatRelativeAgo(a.firedAt),
      at: a.firedAt.getTime(),
      unread: !a.notifiedAt && !a.clearedAt,
    });
  }

  for (const c of commands) {
    const label = c.device.label ?? c.device.mac;
    if (c.status === "FAILED" || c.status === "EXPIRED") {
      items.push({
        id: `cmd-${c.id}`,
        kind: "failure",
        text: `Pump command ${c.status.toLowerCase()} — ${c.action.replace("_", " ")} on ${label}${
          c.stopReason ? ` (${c.stopReason})` : ""
        }`,
        time: formatWhen(c.createdAt),
        at: c.createdAt.getTime(),
        unread: false,
      });
    } else if (c.status === "CONFIRMED") {
      items.push({
        id: `cmd-${c.id}`,
        kind: "command",
        text: `Pump ${c.action === "PUMP_ON" ? "turned on" : "turned off"} — ${c.actorName} on ${label}`,
        time: formatWhen(c.confirmedAt ?? c.createdAt),
        at: (c.confirmedAt ?? c.createdAt).getTime(),
        unread: false,
      });
    }
  }

  items.sort((a, b) => b.at - a.at);

  return (
    <div className="min-h-screen">
      <AppTopBar active="notifications" />
      <div className="p-page pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <NotificationsInbox initialItems={items.slice(0, 50)} />
      </div>
    </div>
  );
}

function conditionLabel(condition: string): string {
  switch (condition) {
    case "SOIL_BELOW":
      return "Soil alert";
    case "TEMP_BELOW":
      return "Low temperature alert";
    case "TEMP_ABOVE":
      return "High temperature alert";
    case "HUMIDITY_BELOW":
      return "Low humidity alert";
    case "HUMIDITY_ABOVE":
      return "High humidity alert";
    default:
      return "Alert";
  }
}
