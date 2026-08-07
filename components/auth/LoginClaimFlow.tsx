"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SlidingTabs } from "../ui/SegmentedControl";
import { FormField, Label } from "../ui/FormField";
import { Button } from "../ui/Button";
import { SuccessPanel } from "../ui/Feedback";
import { ClaimCodeField } from "../device/ClaimCodeField";
import type { ClaimCodeState } from "@/lib/types";

/* Login / Claim your device — GreenGo Login.dc.html. 2 tabs x 4 claim steps =
 * 9 reachable states, all in this one client component per the handoff's
 * single-file structure (spec: handoff/auth.md §1). Copy verbatim.
 *
 * Phase 4B: wired to real endpoints. Claim-code status comes from
 * GET /api/auth/claim-code (debounced), login from POST /api/auth/login,
 * and account creation from POST /api/auth/register. OTP verification
 * itself stays client-side (1234/9999) — see DEVIATIONS.md; the account
 * this creates is real, session-backed, and its phone number is genuinely
 * checked for uniqueness server-side regardless of the OTP step's fidelity.
 */

type Mode = "login" | "claim";
type ClaimStep = "code" | "details" | "otp" | "success";

export function LoginClaimFlow() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [claimStep, setClaimStep] = useState<ClaimStep>("code");

  // Login tab
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  // Claim tab
  const [codeInput, setCodeInput] = useState("");
  const [codeStatus, setCodeStatus] = useState<ClaimCodeState | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerBusy, setRegisterBusy] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const resendTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [deviceLabel, setDeviceLabel] = useState("your device");

  useEffect(() => () => {
    if (resendTimer.current) clearInterval(resendTimer.current);
  }, []);

  // Debounced real claim-code lookup, replacing the Phase 2 hardcoded map.
  useEffect(() => {
    const code = codeInput.trim();
    if (!code) {
      setCodeStatus(null);
      return;
    }
    const handle = setTimeout(() => {
      fetch(`/api/auth/claim-code?code=${encodeURIComponent(code)}`)
        .then((r) => r.json())
        .then((data) => setCodeStatus(data.status))
        .catch(() => setCodeStatus(null));
    }, 300);
    return () => clearTimeout(handle);
  }, [codeInput]);

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

  async function handleLogin() {
    setLoginError("");
    setLoginBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: loginPhone, password: loginPassword }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setLoginError(data?.error || "Incorrect phone number or password.");
        return;
      }
      router.push("/devices");
      router.refresh();
    } finally {
      setLoginBusy(false);
    }
  }

  async function handleVerifyOtp() {
    if (otpInput === "9999") {
      setOtpError("This code has expired — resend to get a new one.");
      return;
    }
    if (otpInput !== "1234") {
      setOtpError("Incorrect code — check the SMS and try again.");
      return;
    }
    setOtpError("");
    setRegisterError("");
    setRegisterBusy(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeInput,
          name: nameInput,
          phone: phoneInput,
          password: passwordInput,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setOtpError(data.error || "Could not create your account.");
        return;
      }
      setDeviceLabel(data.deviceLabel || "your device");
      setClaimStep("success");
    } finally {
      setRegisterBusy(false);
    }
  }

  return (
    <>
      <div className="mb-7 w-full max-w-80">
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
                  other field in the flow which is 100% width. Cap at the
                  column so it never eats the auth padding on narrow phones. */}
              <div className="w-55 max-w-full">
                <FormField
                  label="Phone number"
                  type="tel"
                  inputMode="numeric"
                  placeholder="0244 123 456"
                  size="lg"
                  name="phone"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                />
              </div>
              <FormField
                label="Password"
                type="password"
                placeholder="••••••••"
                size="lg"
                name="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                error={loginError || undefined}
              />
              <Link href="/forgot-password" className="text-sm self-end font-semibold">
                Forgot password?
              </Link>
              <Button
                variant="primary"
                size="md"
                className="mt-1"
                disabled={loginBusy || !loginPhone || !loginPassword}
                onClick={handleLogin}
              >
                {loginBusy ? "Logging in…" : "Log in"}
              </Button>
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
              <ClaimCodeField value={codeInput} onChange={setCodeInput} state={codeStatus} />
              <Button
                variant="primary"
                size="md"
                disabled={codeStatus !== "valid"}
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
              <FormField
                label="Your name"
                placeholder="Full name"
                size="lg"
                name="name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
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
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
              <Button
                variant="primary"
                size="md"
                className="mt-1"
                disabled={!nameInput || !phoneInput || passwordInput.length < 8}
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
              {(otpError || registerError) && (
                <div className="text-sm text-danger font-semibold" role="alert">
                  {otpError || registerError}
                </div>
              )}
              <Button
                variant="primary"
                size="md"
                disabled={otpInput.length !== 4 || registerBusy}
                onClick={handleVerifyOtp}
              >
                {registerBusy ? "Creating account…" : "Verify & create account"}
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
            body={`${deviceLabel} is linked to your account. Calibration starts next.`}
            action={
              <Button variant="primary" size="md" onClick={() => router.push("/devices")}>
                Go to your dashboard
              </Button>
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
