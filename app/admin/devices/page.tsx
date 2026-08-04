import type { Metadata } from "next";
import { AdminTopBar } from "@/components/nav/AdminTopBar";
import { PageTitle } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { AdminDevicesTable } from "@/components/admin/AdminDevicesTable";

/* Admin Devices List → /admin/devices · source: GreenGo Admin Devices List.dc.html
 * Spec: handoff/admin.md §2. */

export const metadata: Metadata = { title: "Devices — GreenGo Admin" };

export default function AdminDevicesListPage() {
  return (
    <div className="min-h-screen">
      <AdminTopBar active="devices" />
      <div className="p-page max-w-wide mx-auto flex flex-col gap-4.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PageTitle>Devices</PageTitle>
          <ButtonLink href="/admin/devices/provision" variant="primary" size="admin">
            + Provision device
          </ButtonLink>
        </div>
        <AdminDevicesTable />
      </div>
    </div>
  );
}
