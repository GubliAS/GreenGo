import type { Metadata } from "next";
import { AdminTopBar } from "@/components/nav/AdminTopBar";
import { ProvisionDeviceFlow } from "@/components/admin/ProvisionDeviceFlow";

/* Provision device → /admin/devices/provision · source: GreenGo Admin Provision Device.dc.html
 * Spec: handoff/admin.md §4. */

export const metadata: Metadata = { title: "Provision a device — GreenGo Admin" };

export default function ProvisionDevicePage() {
  return (
    <div className="min-h-screen">
      <AdminTopBar active="devices" />
      <div className="p-page">
        <ProvisionDeviceFlow />
      </div>
    </div>
  );
}
