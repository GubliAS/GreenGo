import type { Metadata } from "next";
import { AppTopBar } from "@/components/nav/AppTopBar";
import { CalibrationWizard } from "@/components/device/CalibrationWizard";
import { MOCK_DEVICE } from "@/lib/mock/tenant";

/* /devices/[id]/calibration — DEV-005, no handoff design. Spec: handoff/tenant.md §8. */

export const metadata: Metadata = { title: "Calibrate sensor — GreenGo" };

export default async function CalibrationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;

  return (
    <div className="min-h-screen">
      <AppTopBar active="devices" />
      <div className="p-page max-w-form mx-auto">
        <CalibrationWizard deviceLabel={MOCK_DEVICE.label} />
      </div>
    </div>
  );
}
