import type { Metadata } from "next";
import { TenantDetailPage } from "@/components/admin/TenantDetailPage";

/* /admin/tenants/[id] — DEV-005, no handoff design. Spec: handoff/admin.md §8. */

export const metadata: Metadata = { title: "Kwame Asante — GreenGo Admin" };

export default async function AdminTenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  return <TenantDetailPage tenantName="Kwame Asante" />;
}
