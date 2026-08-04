"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SlidingTabs } from "../ui/SegmentedControl";
import { FormField, Label } from "../ui/FormField";
import { Button, ButtonLink } from "../ui/Button";
import { SuccessPanel } from "../ui/Feedback";
import { ClaimCodeField } from "../device/ClaimCodeField";
import type { ClaimCodeState } from "@/lib/types";

/* Login / Claim your device — GreenGo Login.dc.html. 2 tabs x 4 claim steps =
 * 9 reachable states, all in this one client component per the handoff's
 * single-file structure (spec: handoff/auth.md §1). Copy verbatim.
 *
 * Prototype claim-code map, ported from the handoff:
 *   GG-4F82-K1 -> valid · GG-1111-11 -> claimed · GG-2222-22 -> expired
 *   anything else -> invalid · empty -> null (no feedback shown)
 * Replaced by a real claim-code lookup in Phase 4B. */

const CODE_MAP: Record<string, ClaimCodeState> = {
  "GG-4F82-K1": "valid",
  "GG-1111-11": "claimed",
  "GG-2222-22": "expired",
};

function checkCode(code: string): ClaimCodeState | null {
  const c = code.trim().toUpperCase();
  if (!c) return null;
  return CODE_MAP[c] ?? "invalid";
}

type Mode = "login" | "claim";
type ClaimStep = "code" | "details" | "otp" | "success";

export function LoginClaimFlow() {
  const [mode, setMode] = useState<Mode>("login");
  const [claimStep, setClaimStep] = useState<ClaimStep>("code");

  const [codeInput, setCodeInput] = useState("GG-4F82-K1");
  const [phoneInput, setPhoneInput] = useState("0244 123 456");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const resendTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (resendTimer.current) clearInterval(resendTimer.current);
  }, []);

  const startResendTimer = () => {
    if (resendTimer.current) clearInterval(resendTimer.current);
    resendTimer.current = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          if (resendTimer.current) clearInterval(resendTimer.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const markLoggedIn = () => {
    try {
      localStorage.setItem("greengo_logged_in", "1");
    } catch {
      /* private browsing — the session cookie in Phase 4B is authoritative. */
    }
  };

  const status = checkCode(codeInput);

  return (
    <>
      <div className="mb-7 w-80">
        <SlidingTabs
          ariaLabel="Log in or claim your device"
          value={mode}
          onChange={setMode}
          options={[
            { value: "login", label: "Log in" },
            { value: "claim", label: "Claim your device" },
          ]}
        />
      </div>

      <div key={mode} data-gg-anim="1" className="animate-fade">
        {mode === "login" && (
          <div>
            <h1 className="font-display text-auth-h1 tracking-tight text-canopy m-0 mb-2 font-extrabold">
              Log in to your dashboard
            </h1>
            <p className="text-md text-muted m-0 mb-7">
              Check your greenhouse, adjust thresholds, or turn on the pump.
            </p>
            <div className="flex flex-col gap-4">
              {/* Handoff sets this one field to a fixed 220px, unlike every
                  other field in the flow which is 100% width. */}
              <div className="w-55">
                <FormField
                  label="Phone number"
                  type="tel"
                  inputMode="numeric"
                  placeholder="0244 123 456"
                  size="lg"
                  name="phone"
                />
              </div>
              <FormField
                label="Password"
                type="password"
                placeholder="••••••••"
                size="lg"
                name="password"
              />
              <Link href="/forgot-password" className="text-sm self-end font-semibold">
                Forgot password?
              </Link>
              <ButtonLink
                href="/devices"
                variant="primary"
                size="md"
                className="mt-1 text-center"
                onClick={markLoggedIn}
              >
                Log in
              </ButtonLink>
            </div>
          </div>
        )}

        {mode === "claim" && claimStep === "code" && (
          <div>
            <h1 className="font-display text-auth-h1 tracking-tight text-canopy m-0 mb-2 font-extrabold">
              Claim your first device
            </h1>
            <p className="text-md text-muted m-0 mb-6">
              Find the claim code printed on the sticker inside the device
              enclosure, or on your setup card.
            </p>
            <div className="flex flex-col gap-2.5">
              <ClaimCodeField
                value={codeInput}
                onChange={setCodeInput}
                state={status}
                hint={
                  <div className="text-label leading-normal text-faint">
                    Prototype codes — GG-4F82-K1 valid · GG-1111-11 already
                    claimed · GG-2222-22 expired · anything else not
                    recognised.
                  </div>
                }
              />
              <Button
                variant="primary"
                size="md"
                disabled={status !== "valid"}
                className="mt-1"
                onClick={() => setClaimStep("details")}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {mode === "claim" && claimStep === "details" && (
          <div>
            <h1 className="font-display text-auth-h1 tracking-tight text-canopy m-0 mb-2 font-extrabold">
              Set up your account
            </h1>
            <div className="bg-mint rounded-menu mb-5.5 flex items-center justify-between px-4 py-3.5">
              <div>
                <div className="text-micro tracking-widest mb-0.75 text-ink uppercase">
                  Device found
                </div>
                <div className="font-mono text-body text-canopy font-semibold">
                  {codeInput}
                </div>
              </div>
              <button
                onClick={() => setClaimStep("code")}
                className="text-meta cursor-pointer border-0 bg-transparent font-semibold"
              >
                Change code
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <FormField label="Your name" placeholder="Full name" size="lg" name="name" />
              <FormField
                label="Phone number"
                type="tel"
                inputMode="numeric"
                placeholder="0244 123 456"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                size="lg"
                name="phone"
              />
              <FormField
                label="Set a password"
                type="password"
                placeholder="At least 8 characters"
                size="lg"
                name="password"
              />
              <Button
                variant="primary"
                size="md"
                className="mt-1"
                onClick={() => {
                  setOtpInput("");
                  setOtpError("");
                  setResendCooldown(30);
                  startResendTimer();
                  setClaimStep("otp");
                }}
              >
                Send verification code
              </Button>
              <div className="text-caption leading-normal text-muted">
                This links the device to your account and starts calibration
                next.
              </div>
            </div>
          </div>
        )}

        {mode === "claim" && claimStep === "otp" && (
          <div>
            <h1 className="font-display text-auth-h1 tracking-tight text-canopy m-0 mb-2 font-extrabold">
              Verify your phone
            </h1>
            <p className="text-md text-muted m-0 mb-6">
              We sent a 4-digit code by SMS to{" "}
              <strong className="font-mono text-canopy font-semibold">
                {phoneInput}
              </strong>
              .
            </p>
            <div className="flex flex-col gap-2.5">
              <Label htmlFor="otp">Verification code</Label>
              <input
                id="otp"
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
                  if (otpInput === "1234") {
                    markLoggedIn();
                    setClaimStep("success");
                  } else if (otpInput === "9999") {
                    setOtpError(
                      "This code has expired — resend to get a new one.",
                    );
                  } else {
                    setOtpError(
                      "Incorrect code — check the SMS and try again.",
                    );
                  }
                }}
              >
                Verify &amp; create account
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
                    startResendTimer();
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
                Prototype: 1234 verifies · 9999 simulates expiry · anything
                else is treated as incorrect.
              </div>
            </div>
          </div>
        )}

        {mode === "claim" && claimStep === "success" && (
          <SuccessPanel
            title="Phone verified — account created"
            body="Greenhouse 1 is linked to your account. Calibration starts next."
            action={
              <ButtonLink href="/devices" variant="primary" size="md">
                Go to your dashboard
              </ButtonLink>
            }
          />
        )}
      </div>

      {mode === "login" && (
        <div className="text-body text-muted mt-7">
          No device yet?{" "}
          <Link href="/pricing" className="font-semibold">
            Request one
          </Link>
        </div>
      )}
    </>
  );
}
