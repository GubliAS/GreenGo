import type { Metadata } from "next";
import { DeviceDetailPage } from "@/components/admin/DeviceDetailPage";

/* Admin Device Detail → /admin/devices/[id] · source: GreenGo Admin Device Detail.dc.html
 * Spec: handoff/admin.md §3. */

export const metadata: Metadata = { title: "Greenhouse 1 — GreenGo Admin" };

export default async function AdminDeviceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  return <DeviceDetailPage deviceLabel="Greenhouse 1" />;
}
