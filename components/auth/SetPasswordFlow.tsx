"use client";

import { useState } from "react";
import { FormField } from "../ui/FormField";
import { Button, ButtonLink } from "../ui/Button";
import { SuccessPanel } from "../ui/Feedback";

/* /set-password — DEV-005, no handoff design. Extracted from the claim
 * `details` step's password field (handoff/auth.md §3). Used when a session
 * needs a password set without the full claim flow — e.g. a tenant invited
 * directly by an admin, or the target of an expired-password prompt. */

export function SetPasswordFlow() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <SuccessPanel
        title="Password set"
        body="You're all set — head to your dashboard."
        action={
          <ButtonLink href="/devices" variant="primary" size="md">
            Go to your dashboard
          </ButtonLink>
        }
      />
    );
  }

  const mismatch = confirm.length > 0 && password !== confirm;
  const ready = password.length >= 8 && password === confirm;

  return (
    <div>
      <h1 className="font-display text-auth-h1 tracking-tight text-canopy m-0 mb-2 font-extrabold">
        Set a password
      </h1>
      <p className="text-md text-muted m-0 mb-7">
        This is what you&apos;ll use to log in from now on.
      </p>
      <div className="flex flex-col gap-4">
        <FormField
          label="New password"
          type="password"
          placeholder="At least 8 characters"
          size="lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          name="password"
        />
        <FormField
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          size="lg"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={mismatch ? "Passwords don't match." : undefined}
          name="confirm"
        />
        <Button
          variant="primary"
          size="md"
          className="mt-1"
          disabled={!ready}
          onClick={() => setDone(true)}
        >
          Save password
        </Button>
      </div>
    </div>
  );
}
