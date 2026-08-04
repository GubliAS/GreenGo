import type { Metadata } from "next";
import Link from "next/link";
import { AdminTopBar } from "@/components/nav/AdminTopBar";
import { BackLink, PageTitle, Card, CardTitle } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { MOCK_ADMIN } from "@/lib/mock/admin";

/* Account settings → /admin/account · source: GreenGo Admin Account Settings.dc.html
 * Spec: handoff/admin.md §5. Reached from the profile avatar dropdown. */

export const metadata: Metadata = { title: "Account settings — GreenGo Admin" };

export default function AdminAccountPage() {
  return (
    <div className="min-h-screen">
      <AdminTopBar profileInteractive={false} />
      <div className="p-page max-w-form-sm mx-auto">
        <BackLink href="/admin/devices">← Back</BackLink>
        <PageTitle className="mt-2 mb-5">Account settings</PageTitle>

        <div className="flex flex-col gap-3.5">
          <Card className="flex flex-col gap-4">
            <CardTitle>Profile</CardTitle>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
              <FormField label="Name" size="sm" defaultValue={MOCK_ADMIN.name} name="name" />
              <FormField label="Email" size="sm" defaultValue={MOCK_ADMIN.email} name="email" />
            </div>
            <FormField label="Role" size="sm" defaultValue="Super admin" readOnly name="role" />
          </Card>

          <Card className="flex flex-col gap-3.5">
            <CardTitle>Password</CardTitle>
            <FormField
              label="New password"
              type="password"
              size="sm"
              placeholder="At least 8 characters"
              name="password"
            />
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="primary" size="form">
              Save changes
            </Button>
            <Link href="/" className="text-sm text-danger font-semibold">
              Log out
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
