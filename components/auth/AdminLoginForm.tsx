"use client";

import { useState } from "react";
import Link from "next/link";
import { FormField } from "../ui/FormField";
import { ButtonLink } from "../ui/Button";

/* /admin/login — DEV-005, no handoff design. Reuses the Login shell's layout
 * but the identifier is EMAIL, not phone: admins are not tenants, and the
 * evidence for this is the handoff's own Admin Account Settings screen, which
 * shows an Email field for the admin profile. Spec: handoff/auth.md §4. */

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div>
      <h1 className="font-display text-auth-h1 tracking-tight text-canopy m-0 mb-2 font-extrabold">
        Admin sign in
      </h1>
      <p className="text-md text-muted m-0 mb-7">
        Fleet operations and support tooling.
      </p>
      <div className="flex flex-col gap-4">
        <FormField
          label="Email"
          type="email"
          placeholder="ops@greengo.dev"
          size="lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          name="email"
        />
        <FormField
          label="Password"
          type="password"
          placeholder="••••••••"
          size="lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          name="password"
        />
        <ButtonLink
          href="/admin"
          variant="primary"
          size="md"
          className="mt-1 text-center"
        >
          Log in
        </ButtonLink>
      </div>
      <div className="text-body text-muted mt-7">
        <Link href="/login" className="font-semibold">
          Farmer login →
        </Link>
      </div>
    </div>
  );
}
