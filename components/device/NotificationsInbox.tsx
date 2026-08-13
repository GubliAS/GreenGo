"use client";

import { useState } from "react";
import { PageTitle, Card } from "../ui/Card";
import { EmptyState } from "../ui/Feedback";
import { Pagination } from "../ui/Pagination";

/* /notifications — DEV-005. Server supplies real Alert/Command rows. */

export type NotificationKind = "alert" | "command" | "failure";

export type NotificationItem = {
  id: string;
  kind: NotificationKind;
  text: string;
  time: string;
  at: number;
  unread: boolean;
};

const DOT: Record<NotificationKind, string> = {
  alert: "bg-warn",
  command: "bg-leaf",
  failure: "bg-danger",
};

const PAGE_SIZE = 10;

export function NotificationsInbox({
  initialItems,
}: {
  initialItems: NotificationItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const unreadCount = items.filter((i) => i.unread).length;
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-table mx-auto flex flex-col gap-4 sm:gap-4.5">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <PageTitle>Notifications</PageTitle>
        {unreadCount > 0 && (
          <button
            onClick={() => setItems((prev) => prev.map((i) => ({ ...i, unread: false })))}
            className="text-meta text-leaf inline-flex min-h-11 cursor-pointer items-center border-0 bg-transparent px-1 font-semibold"
          >
            Mark all as read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          body="Alerts and pump activity for your devices will show up here."
        />
      ) : (
        <>
          <Card className="flex flex-col gap-0 overflow-hidden p-0">
            {pageItems.map((item, i) => (
              <div
                key={item.id}
                className={`flex items-start gap-3 px-4 py-3.5 sm:px-6 sm:py-4 ${
                  i > 0 ? "border-hairline-soft border-t" : ""
                } ${item.unread ? "bg-mint" : ""}`}
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT[item.kind]}`}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-body text-canopy leading-snug">{item.text}</div>
                  <div className="text-label text-muted mt-0.5">{item.time}</div>
                </div>
              </div>
            ))}
          </Card>
          <Pagination
            page={page}
            pageCount={pageCount}
            totalRows={items.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="Notification pages"
          />
        </>
      )}
    </div>
  );
}
