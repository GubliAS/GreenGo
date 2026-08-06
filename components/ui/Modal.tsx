"use client";

import { useCallback, useEffect, useId, useRef, type ReactNode } from "react";
import { IconClose } from "../icons";
import { Button } from "./Button";
import { FormField } from "./FormField";

/* DEV-004 — the handoff contains no modals. Geometry is borrowed from the
 * profile-menu card (radius 12, shadow-menu, 1.5px line-soft border) so this
 * reads as part of the same system.
 *
 * Below --breakpoint-nav (760px) it becomes a bottom sheet, using the mobile
 * menu panel's treatment instead (radius 16 top corners, shadow-panel,
 * gg-rise). One component, two presentations — the same switch the handoff
 * makes for navigation.
 *
 * Accessibility here is entirely additive, since the handoff has no reference:
 * focus trap, ESC to close, click-outside, restore focus on close, scroll lock,
 * and a max-height that keeps the sheet inside the viewport (a Phase 5
 * requirement: "modals taller than the viewport").
 */

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  /** Wider variant for tables/logs inside a dialog. */
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (n) => n.offsetParent !== null,
      );
      if (nodes.length === 0) return;
      const first = nodes[0]!;
      const last = nodes[nodes.length - 1]!;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [open, onClose],
  );

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown, true);

    // Focus the first focusable node, falling back to the panel itself.
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", handleKeyDown, true);
      previouslyFocused.current?.focus();
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const widths = {
    sm: "nav:max-w-narrow",
    md: "nav:max-w-form-sm",
    lg: "nav:max-w-table",
  } as const;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center nav:items-center"
      role="presentation"
    >
      {/* Scrim — canopy at 50%, derived from the palette rather than a new colour. */}
      <div
        className="bg-canopy/50 absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        data-gg-anim="1"
        className={`animate-rise-fast border-hair border-line-soft shadow-panel nav:shadow-menu nav:rounded-menu max-h-modal-mobile relative flex w-full flex-col overflow-hidden rounded-t-panel bg-white nav:max-h-modal-desktop nav:rounded-b-menu ${widths[size]}`}
      >
        <div className="border-hairline flex items-start justify-between gap-4 border-b px-6 py-5">
          <div>
            <h2
              id={titleId}
              className="font-display text-21 text-canopy tracking-tight m-0 font-extrabold"
            >
              {title}
            </h2>
            {description && (
              <p id={descId} className="text-meta text-muted leading-normal m-0 mt-1.5">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted hover:text-canopy hover:bg-mint rounded-sm shrink-0 cursor-pointer border-0 bg-transparent p-2"
          >
            <IconClose size={18} />
          </button>
        </div>

        {children && <div className="overflow-y-auto px-6 py-5">{children}</div>}

        {footer && (
          <div className="border-hairline flex flex-wrap justify-end gap-2.5 border-t px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── ConfirmDialog ─────────────────────────────────────────────────────────
   Wraps the handoff's type-to-confirm pattern inside a Modal, preserving the
   requirement rather than replacing it: the confirm button stays disabled
   until the typed value matches exactly.

   Note this does NOT replace the two inline typed-confirmations on Admin
   Device Detail — those stay exactly as designed. This is for the DEV-005
   pages, which have no designed confirmation treatment of their own. */

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  /** The exact string the user must type. Omit for a plain confirmation. */
  confirmPhrase,
  confirmLabel = "Confirm",
  typedValue = "",
  onTypedValueChange,
  destructive = true,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  description?: ReactNode;
  confirmPhrase?: string;
  confirmLabel?: string;
  typedValue?: string;
  onTypedValueChange?: (v: string) => void;
  destructive?: boolean;
}) {
  const locked = confirmPhrase ? typedValue !== confirmPhrase : false;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "primary"}
            size="sm"
            disabled={locked}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {confirmPhrase && (
        <FormField
          size="inline"
          label={
            <>
              Type <span className="font-mono">{confirmPhrase}</span> to confirm
            </>
          }
          value={typedValue}
          onChange={(e) => onTypedValueChange?.(e.target.value)}
          placeholder={confirmPhrase}
          autoComplete="off"
        />
      )}
    </Modal>
  );
}
