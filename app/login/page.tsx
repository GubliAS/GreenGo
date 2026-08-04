import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginClaimFlow } from "@/components/auth/LoginClaimFlow";

/* Login / Claim → /login · source: GreenGo Login.dc.html
 * Spec: handoff/auth.md §1. 9 reachable states in one client component. */

export const metadata: Metadata = {
  title: "Log in — GreenGo",
};

export default function LoginPage() {
  return (
    <AuthShell>
      <LoginClaimFlow />
    </AuthShell>
  );
}
