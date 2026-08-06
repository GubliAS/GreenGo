"use client";

import { useEffect, useRef, useState } from "react";
import { IconCaret } from "../icons";

/* Replaces the native <select>. Two instances on Admin Devices List (status and
 * tenant filters). A button showing the current value with a rotating caret,
 * opening a floating card-styled menu with per-option active highlighting.
 *
 * The handoff prototype does not implement click-outside-to-close and its
 * README says to add it in production — done here, along with the keyboard
 * support a real listbox needs (arrows, Home/End, Enter/Space, Escape). */

export function Dropdown({
  value,
  options,
  onChange,
  label,
  minWidth = 180,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  /** Accessible name — the handoff's filters have only a visual value, no label. */
  label: string;
  minWidth?: number;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, options.indexOf(value)),
  );
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  const commit = (i: number) => {
    const next = options[i];
    if (next !== undefined) onChange(next);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(options.length - 1, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        commit(activeIndex);
        break;
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${value}`}
        className={`border-hair rounded-tile text-body text-canopy flex cursor-pointer items-center gap-2 bg-white px-3.5 py-2.5 ${
          open ? "border-leaf" : "border-line"
        }`}
      >
        {value}
        <span
          className="inline-flex transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : undefined }}
        >
          <IconCaret size={12} />
        </span>
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label={label}
          aria-activedescendant={`${label}-opt-${activeIndex}`}
          tabIndex={-1}
          onKeyDown={onKeyDown}
          className="border-hair border-line-soft rounded-menu shadow-menu top-menu-gap absolute left-0 z-20 m-0 list-none bg-white p-1.5"
          style={{ minWidth }}
        >
          {options.map((o, i) => {
            const selected = o === value;
            return (
              <li
                key={o}
                id={`${label}-opt-${i}`}
                role="option"
                aria-selected={selected}
                onClick={() => commit(i)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`rounded-sm text-sm cursor-pointer px-3 py-2.25 ${
                  selected
                    ? "bg-mint text-canopy font-semibold"
                    : i === activeIndex
                      ? "bg-app text-ink"
                      : "text-ink"
                }`}
              >
                {o}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
