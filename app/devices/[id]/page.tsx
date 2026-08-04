import type { Metadata } from "next";
import { AppTopBar } from "@/components/nav/AppTopBar";
import { DeviceDashboard } from "@/components/device/DeviceDashboard";
import { MOCK_DEVICE } from "@/lib/mock/tenant";

/* Device dashboard → /devices/[id] · source: GreenGo Device Dashboard.dc.html
 * Spec: handoff/tenant.md §2. */

export const metadata: Metadata = { title: "Greenhouse 1 — GreenGo" };

export default async function DeviceDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen">
      <AppTopBar active="devices" />
      <div className="p-page">
        <DeviceDashboard deviceId={id} deviceLabel={MOCK_DEVICE.label} />
      </div>
    </div>
  );
}
