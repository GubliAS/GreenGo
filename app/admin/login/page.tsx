import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";

/* /admin/login — DEV-005, no handoff design. Spec: handoff/auth.md §4. */

export const metadata: Metadata = {
  title: "Admin sign in — GreenGo",
};

export default function AdminLoginPage() {
  return (
    <AuthShell admin logoHref="/admin">
      <AdminLoginForm />
    </AuthShell>
  );
}
