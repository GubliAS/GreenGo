import type { Metadata } from "next";
import { AppTopBar } from "@/components/nav/AppTopBar";
import { AddDeviceFlow, AddDeviceBackLink } from "@/components/device/AddDeviceFlow";

/* Add a device → /devices/add · source: GreenGo Add Device.dc.html
 * Spec: handoff/tenant.md §5. */

export const metadata: Metadata = { title: "Add a device — GreenGo" };

export default function AddDevicePage() {
  return (
    <div className="min-h-screen">
      <AppTopBar active="devices" />
      <div className="p-page mx-auto max-w-narrow">
        <AddDeviceBackLink />
        <AddDeviceFlow />
      </div>
    </div>
  );
}
