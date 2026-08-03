"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { IconCheck, IconClose, IconWarning } from "../icons";

/* DEV-004 — no handoff reference. Colour sets are the claim-code feedback
 * palettes that already exist (mint/warn/danger), and the card geometry is the
 * floating-menu treatment, so toasts read as part of the same system.
 *
 * Live-region semantics: `assertive` for danger (an action failed and the user
 * must know now), `polite` otherwise. */

export type ToastTone = "success" | "warn" | "danger" | "info";

type Toast = {
  id: number;
  tone: ToastTone;
  title: string;
  body?: string;
};

const TONES: Record<ToastTone, string> = {
  success: "bg-mint border-leaf text-canopy",
  warn: "bg-warn-bg border-pending text-warn-text",
  danger: "bg-danger-bg border-danger-border text-danger",
  info: "bg-white border-line-soft text-canopy",
};

type ToastContextValue = {
  push: (t: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

let nextId = 0;

export function ToastProvider({
  children,
  autoDismissMs = 6000,
}: {
  children: ReactNode;
  autoDismissMs?: number;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = nextId++;
      setToasts((prev) => [...prev, { ...t, id }]);
      // Danger toasts persist until dismissed — a failed pump command should
      // not disappear on its own.
      if (t.tone !== "danger") {
        setTimeout(() => dismiss(id), autoDismissMs);
      }
    },
    [autoDismissMs, dismiss],
  );

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-60 flex flex-col items-center gap-2.5 p-4 nav:inset-x-auto nav:right-0 nav:items-end"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === "danger" ? "alert" : "status"}
            data-gg-anim="1"
            className={`animate-rise-fast border-hair shadow-menu rounded-menu pointer-events-auto flex w-full max-w-96 items-start gap-2.5 px-4 py-3.5 ${TONES[t.tone]}`}
          >
            <span className="mt-0.5 shrink-0">
              {t.tone === "success" ? (
                <IconCheck size={16} />
              ) : t.tone === "info" ? null : (
                <IconWarning size={16} />
              )}
            </span>
            <div className="flex-1">
              <div className="text-body font-semibold">{t.title}</div>
              {t.body && (
                <div className="text-meta leading-normal mt-1 opacity-80">{t.body}</div>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="shrink-0 cursor-pointer border-0 bg-transparent p-1 opacity-60 hover:opacity-100"
            >
              <IconClose size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
