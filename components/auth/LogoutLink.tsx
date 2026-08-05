"use client";

import { useRouter } from "next/navigation";

/* Every "Log out" link in the handoff is a plain <a href> to the landing
 * page. Replaced with a real POST /api/auth/logout call (clears the session
 * cookie + writes the audit entry) that then navigates to the same place —
 * visually identical, actually logs out. */

export function LogoutLink({
  className,
  redirectTo = "/",
  children = "Log out",
  role,
}: {
  className?: string;
  redirectTo?: string;
  children?: React.ReactNode;
  role?: string;
}) {
  const router = useRouter();

  return (
    <button
      role={role}
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        router.push(redirectTo);
        router.refresh();
      }}
      className={`block w-full cursor-pointer border-0 bg-transparent text-left ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
