import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordFlow } from "@/components/auth/ForgotPasswordFlow";

/* /forgot-password — DEV-005, no handoff design. Spec: handoff/auth.md §2. */

export const metadata: Metadata = {
  title: "Reset your password — GreenGo",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <ForgotPasswordFlow />
    </AuthShell>
  );
}
