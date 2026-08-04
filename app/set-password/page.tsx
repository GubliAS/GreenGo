import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { SetPasswordFlow } from "@/components/auth/SetPasswordFlow";

/* /set-password — DEV-005, no handoff design. Spec: handoff/auth.md §3. */

export const metadata: Metadata = {
  title: "Set a password — GreenGo",
};

export default function SetPasswordPage() {
  return (
    <AuthShell>
      <SetPasswordFlow />
    </AuthShell>
  );
}
