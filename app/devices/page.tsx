import type { Metadata } from "next";
import { AppTopBar } from "@/components/nav/AppTopBar";
import { SegmentedBar } from "@/components/ui/SegmentedBar";
import { StatusPill } from "@/components/ui/StatusPill";
import { EmptyState } from "@/components/ui/Feedback";
import { PageTitle } from "@/components/ui/Card";
import Link from "next/link";
import { MOCK_DEVICE } from "@/lib/mock/tenant";

/* Devices list → /devices · source: GreenGo Devices List.dc.html
 * Spec: handoff/tenant.md §1. Reference implementation for the app top bar's
 * mobile variant. State coverage: confirmed only (MANIFEST §D.2). */

export const metadata: Metadata = { title: "Your greenhouses — GreenGo" };

export default function DevicesListPage() {
  return (
    <div className="min-h-screen">
      <AppTopBar active="devices" />

      <div className="p-devices-page">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <PageTitle size="lg">Your greenhouses</PageTitle>
          <div className="text-body text-muted">1 device</div>
        </div>

        <div className="max-w-app grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4.5">
          <Link
            href={`/devices/${MOCK_DEVICE.id}`}
            className="border-hair border-hairline rounded-card flex flex-col gap-4 bg-white p-6 text-inherit"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xl text-canopy mb-1 font-bold">
                  {MOCK_DEVICE.label}
                </div>
                <div className="text-meta text-muted">
                  {MOCK_DEVICE.location} · {MOCK_DEVICE.installedLabel}
                </div>
              </div>
              <StatusPill tone="mint" dot size="md">
                Online
              </StatusPill>
            </div>

            <SegmentedBar percent={38} count={16} height={24} surface="app" radius="sm" />

            <div className="text-sm text-ink flex items-center justify-between">
              <span>
                Soil <strong className="font-mono text-canopy">38%</strong> · last
                seen 8s ago
              </span>
              <span className="text-muted">No active alerts</span>
            </div>
          </Link>

          <EmptyState
            title="Add a device"
            body="You already have an account — just enter the claim code for the next greenhouse."
            action={
              <Link href="/devices/add" className="text-sm text-leaf font-semibold">
                I have a claim code
              </Link>
            }
          />
        </div>
      </div>
    </div>
  );
}
