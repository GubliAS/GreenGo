"use client";

import { useState } from "react";
import { AdminTopBar } from "../nav/AdminTopBar";
import { BackLink, PageTitle } from "../ui/Card";
import { DeviceDetailTabs } from "./DeviceDetailTabs";
import type { AdminRole } from "@/lib/types";
import { MOCK_ADMIN, MOCK_ADMIN_DEVICE } from "@/lib/mock/admin";

/* Holds the role state shared between AdminTopBar's toggle (top-right) and
 * DeviceDetailTabs (which reads it to decide whether destructive controls
 * exist in the DOM). Role toggle demoed ONLY on this screen per the handoff. */

export function DeviceDetailPage({ deviceLabel }: { deviceLabel: string }) {
  const [role, setRole] = useState<AdminRole>("super_admin");

  return (
    <div className="min-h-screen">
      <AdminTopBar
        active="devices"
        role={role}
        onRoleChange={setRole}
        adminName={MOCK_ADMIN.name}
        adminEmail={MOCK_ADMIN.email}
        initials={MOCK_ADMIN.initials}
      />
      <div className="p-page max-w-app mx-auto flex flex-col gap-4.5">
        <div>
          <BackLink href="/admin/devices">← All devices</BackLink>
          <PageTitle className="mt-1.5">{deviceLabel}</PageTitle>
        </div>
        <DeviceDetailTabs role={role} device={MOCK_ADMIN_DEVICE} />
      </div>
    </div>
  );
}
