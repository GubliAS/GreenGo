"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { FormField, Label } from "../ui/FormField";
import { Button } from "../ui/Button";
import { SuccessPanel } from "../ui/Feedback";

/* /forgot-password — DEV-005, no handoff design. Composed from the Login
 * shell's identify step plus the claim flow's OTP step, reused verbatim
 * (30s resend cooldown, same two error strings) so the product feels like
 * one system rather than a bolted-on flow. Spec: handoff/auth.md §2.
 *
 * Step 3 (new password) is inline here rather than a separate route, since
 * the OTP already proved phone ownership — no reason to make the user
 * navigate again. /set-password (a standalone route) exists for the
 * already-authenticated "change password" case instead. */

type Step = "identify" | "otp" | "reset" | "done";

export function ForgotPasswordFlow() {
  const [step, setStep] = useState<Step>("identify");
  const [phone, setPhone] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          if (timer.current) clearInterval(timer.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  if (step === "identify") {
    return (
      <div>
        <h1 className="font-display text-auth-h1 tracking-tight text-canopy m-0 mb-2 font-extrabold">
          Reset your password
        </h1>
        <p className="text-md text-muted m-0 mb-7">
          We&apos;ll text a verification code to the phone number on your
          account.
        </p>
        <div className="flex flex-col gap-4">
          <FormField
            label="Phone number"
            type="tel"
            inputMode="numeric"
            placeholder="0244 123 456"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            size="lg"
            name="phone"
          />
          <Button
            variant="primary"
            size="md"
            className="mt-1"
            disabled={phone.trim().length === 0}
            onClick={() => {
              setOtpInput("");
              setOtpError("");
              setResendCooldown(30);
              startTimer();
              setStep("otp");
            }}
          >
            Send verification code
          </Button>
          {/* Identical response and timing whether or not the account exists —
              no tenant enumeration. Wired for real in Phase 4B; this mock
              behaves that way already so the UI never leaks the distinction. */}
          <div className="text-caption leading-normal text-muted">
            If that number is on a GreenGo account, we&apos;ve sent a code.
          </div>
        </div>
        <div className="text-body text-muted mt-7">
          <Link href="/login" className="font-semibold">
            ← Back to log in
          </Link>
        </div>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div>
        <h1 className="font-display text-auth-h1 tracking-tight text-canopy m-0 mb-2 font-extrabold">
          Verify your phone
        </h1>
        <p className="text-md text-muted m-0 mb-6">
          We sent a 4-digit code by SMS to{" "}
          <strong className="font-mono text-canopy font-semibold">
            {phone || "your phone"}
          </strong>
          .
        </p>
        <div className="flex flex-col gap-2.5">
          <Label htmlFor="fp-otp">Verification code</Label>
          <input
            id="fp-otp"
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={otpInput}
            onChange={(e) => {
              setOtpInput(e.target.value.replace(/[^0-9]/g, "").slice(0, 4));
              setOtpError("");
            }}
            placeholder="••••"
            aria-invalid={otpError ? true : undefined}
            className={`border-hair rounded-input text-26 font-mono tracking-otp box-border w-40 p-3.5 text-center ${
              otpError ? "border-danger-border" : "border-line"
            }`}
          />
          {otpError && (
            <div className="text-sm text-danger font-semibold" role="alert">
              {otpError}
            </div>
          )}
          <Button
            variant="primary"
            size="md"
            disabled={otpInput.length !== 4}
            onClick={() => {
              if (otpInput === "1234") setStep("reset");
              else if (otpInput === "9999")
                setOtpError("This code has expired — resend to get a new one.");
              else setOtpError("Incorrect code — check the SMS and try again.");
            }}
          >
            Verify code
          </Button>
          <div className="text-sm text-muted">
            {resendCooldown > 0 ? (
              <>Resend available in {resendCooldown}s ·</>
            ) : (
              "Didn't get it?"
            )}{" "}
            <button
              onClick={() => {
                if (resendCooldown > 0) return;
                setOtpInput("");
                setOtpError("");
                setResendCooldown(30);
                startTimer();
              }}
              disabled={resendCooldown > 0}
              className={`cursor-pointer border-0 bg-transparent font-semibold ${
                resendCooldown > 0
                  ? "text-faint pointer-events-none cursor-not-allowed"
                  : "text-leaf"
              }`}
            >
              Resend code
            </button>
          </div>
          <div className="text-label text-faint">
            Prototype: 1234 verifies · 9999 simulates expiry · anything else is
            treated as incorrect.
          </div>
        </div>
      </div>
    );
  }

  if (step === "reset") {
    const mismatch = confirm.length > 0 && password !== confirm;
    const ready = password.length >= 8 && password === confirm;
    return (
      <div>
        <h1 className="font-display text-auth-h1 tracking-tight text-canopy m-0 mb-2 font-extrabold">
          Set a new password
        </h1>
        <p className="text-md text-muted m-0 mb-7">
          Choose something you haven&apos;t used before.
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
            onClick={() => setStep("done")}
          >
            Save new password
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SuccessPanel
      title="Password updated"
      body="You can now log in with your new password."
      action={
        <Link
          href="/login"
          className="rounded-button bg-leaf hover:bg-leaf-deep text-md inline-flex items-center justify-center px-6.5 py-3.5 font-semibold text-white"
        >
          Go to log in
        </Link>
      }
    />
  );
}
