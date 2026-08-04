"use client";

import { useState } from "react";
import { PageTitle, Card } from "../ui/Card";
import { EmptyState } from "../ui/Feedback";
import { Pagination } from "../ui/Pagination";

/* /notifications — DEV-005, no handoff design. Nearest reference is the Admin
 * Fleet Overview activity feed (8px coloured dot + bold actor + text +
 * timestamp), reused here for the tenant's own notification kinds
 * (handoff/tenant.md §9). */

type Kind = "alert" | "command" | "failure";

const DOT: Record<Kind, string> = {
  alert: "bg-warn",
  command: "bg-leaf",
  failure: "bg-danger",
};

const MOCK: { id: string; kind: Kind; text: string; time: string; unread: boolean }[] = [
  {
    id: "1",
    kind: "alert",
    text: "Soil alert — 24% (below 30% threshold) on Greenhouse 1",
    time: "8 minutes ago",
    unread: true,
  },
  {
    id: "2",
    kind: "command",
    text: "Pump turned on automatically (AUTO, soil below threshold)",
    time: "8 minutes ago",
    unread: true,
  },
  {
    id: "3",
    kind: "command",
    text: "Pump command confirmed — ran 4m 20s, soil reached 70%",
    time: "Today, 6:19 AM",
    unread: false,
  },
  {
    id: "4",
    kind: "failure",
    text: "Pump command failed — device did not acknowledge within 10s",
    time: "3 days ago",
    unread: false,
  },
];

export function NotificationsInbox() {
  const [items, setItems] = useState(MOCK);
  const [page, setPage] = useState(1);
  const unreadCount = items.filter((i) => i.unread).length;

  return (
    <div className="max-w-table mx-auto flex flex-col gap-4.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle>Notifications</PageTitle>
        {unreadCount > 0 && (
          <button
            onClick={() => setItems((prev) => prev.map((i) => ({ ...i, unread: false })))}
            className="text-meta text-leaf cursor-pointer border-0 bg-transparent font-semibold"
          >
            Mark all as read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState title="No notifications yet" body="Alerts and pump activity will show up here." />
      ) : (
        <>
          <Card className="flex flex-col gap-0 p-0">
            {items.map((item, i) => (
              <div
                key={item.id}
                className={`flex items-start gap-3 px-6 py-4 ${
                  i > 0 ? "border-hairline-soft border-t" : ""
                } ${item.unread ? "bg-mint" : ""}`}
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT[item.kind]}`}
                  aria-hidden="true"
                />
                <div className="flex-1">
                  <div className="text-body text-canopy">{item.text}</div>
                  <div className="text-label text-muted mt-0.5">{item.time}</div>
                </div>
              </div>
            ))}
          </Card>
          <Pagination page={page} pageCount={1} onPageChange={setPage} label="Notification pages" />
        </>
      )}
    </div>
  );
}
