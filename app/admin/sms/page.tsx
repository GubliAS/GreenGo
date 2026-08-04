import type { Metadata } from "next";
import { AdminTopBar } from "@/components/nav/AdminTopBar";
import { PageTitle } from "@/components/ui/Card";
import { AdminSmsTable } from "@/components/admin/AdminSmsTable";

/* /admin/sms — DEV-005, no handoff design. Spec: handoff/admin.md §10.
 * DEV-006: one of the three new admin nav items. */

export const metadata: Metadata = { title: "SMS log — GreenGo Admin" };

export default function AdminSmsPage() {
  return (
    <div className="min-h-screen">
      <AdminTopBar active="sms" />
      <div className="p-page max-w-wide mx-auto flex flex-col gap-4.5">
        <PageTitle>SMS log</PageTitle>
        <AdminSmsTable />
      </div>
    </div>
  );
}
