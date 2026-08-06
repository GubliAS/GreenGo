"use client";

import { useEffect } from "react";

/* Registers public/sw.js once the app has hydrated. A render-nothing client
 * component mounted in the root layout — DEV-014. */

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registration failing (unsupported browser, blocked by a dev proxy,
        // etc.) shouldn't break the app — it only means no offline shell.
      });
    }
  }, []);

  return null;
}
