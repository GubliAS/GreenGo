import type { Metadata } from "next";
import { AppTopBar } from "@/components/nav/AppTopBar";
import { NotificationsInbox } from "@/components/device/NotificationsInbox";

/* /notifications — DEV-005, no handoff design. Spec: handoff/tenant.md §9.
 * DEV-006: the one net-new tenant nav item. */

export const metadata: Metadata = { title: "Notifications — GreenGo" };

export default function NotificationsPage() {
  return (
    <div className="min-h-screen">
      <AppTopBar active="notifications" />
      <div className="p-page">
        <NotificationsInbox />
      </div>
    </div>
  );
}
