import type { Metadata } from "next";
import { AppTopBar } from "@/components/nav/AppTopBar";
import { CalibrationWizard } from "@/components/device/CalibrationWizard";
import { requireTenantId } from "@/lib/db";
import { getSession } from "@/lib/session";
import { resolveTenantDeviceForSubpath } from "@/lib/device-route";

export const metadata: Metadata = { title: "Calibrate sensor — GreenGo" };
export const dynamic = "force-dynamic";

export default async function CalibrationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();
  const tenantId = requireTenantId(session?.kind === "tenant" ? session : null);
  const device = await resolveTenantDeviceForSubpath(slug, tenantId, "calibration");

  return (
    <div className="min-h-screen">
      <AppTopBar active="devices" deviceSlug={device.slug} />
      <div className="p-page max-w-form mx-auto">
        <CalibrationWizard
          deviceLabel={device.label ?? device.mac}
          deviceSlug={device.slug}
        />
      </div>
    </div>
  );
}
