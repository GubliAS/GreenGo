import type { Metadata } from "next";
import { AdminTopBar } from "@/components/nav/AdminTopBar";
import { BackLink, PageTitle } from "@/components/ui/Card";
import { AdminCommandsTable } from "@/components/admin/AdminCommandsTable";

/* /admin/commands — DEV-005, no handoff design. Spec: handoff/admin.md §9.
 * Not a nav item — reached from the Fleet Overview activity-feed link. */

export const metadata: Metadata = { title: "Commands — GreenGo Admin" };

export default function AdminCommandsPage() {
  return (
    <div className="min-h-screen">
      <AdminTopBar />
      <div className="p-page max-w-wide mx-auto flex flex-col gap-4.5">
        <div>
          <BackLink href="/admin">← Fleet overview</BackLink>
          <PageTitle className="mt-1.5">Commands</PageTitle>
        </div>
        <AdminCommandsTable />
      </div>
    </div>
  );
}
