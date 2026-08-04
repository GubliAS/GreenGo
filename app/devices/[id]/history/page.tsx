import type { Metadata } from "next";
import { AppTopBar } from "@/components/nav/AppTopBar";
import { HistoryPage } from "@/components/device/HistoryPage";
import { MOCK_DEVICE } from "@/lib/mock/tenant";

/* /devices/[id]/history — DEV-005, no handoff design. Spec: handoff/tenant.md §7. */

export const metadata: Metadata = { title: "Moisture history — GreenGo" };

export default async function DeviceHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;

  return (
    <div className="min-h-screen">
      <AppTopBar active="devices" />
      <div className="p-page">
        <HistoryPage deviceLabel={MOCK_DEVICE.label} />
      </div>
    </div>
  );
}
