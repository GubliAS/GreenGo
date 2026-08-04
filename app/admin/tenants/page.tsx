import type { Metadata } from "next";
import { AdminTopBar } from "@/components/nav/AdminTopBar";
import { PageTitle } from "@/components/ui/Card";
import { AdminTenantsTable } from "@/components/admin/AdminTenantsTable";

/* /admin/tenants — DEV-005, no handoff design. Spec: handoff/admin.md §7.
 * DEV-006: one of the three new admin nav items. */

export const metadata: Metadata = { title: "Tenants — GreenGo Admin" };

export default function AdminTenantsPage() {
  return (
    <div className="min-h-screen">
      <AdminTopBar active="tenants" />
      <div className="p-page max-w-wide mx-auto flex flex-col gap-4.5">
        <PageTitle>Tenants</PageTitle>
        <AdminTenantsTable />
      </div>
    </div>
  );
}
