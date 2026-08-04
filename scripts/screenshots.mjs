/* Visual + responsive audit harness.
 *
 * Screenshots every route at the viewports the brief names for Phase 5
 * (380, 414, 768, 1024, 1440) and reports mechanical failures:
 *   - horizontal page overflow
 *   - any element wider than the viewport
 *   - touch targets under 44px
 *   - console/page errors
 *   - non-OK HTTP status
 *
 * Usage:
 *   node scripts/screenshots.mjs                        # all routes, 2 viewports
 *   VIEWPORTS=all node scripts/screenshots.mjs          # all 5 Phase-5 widths
 *   ROUTES=/,/pricing node scripts/screenshots.mjs      # specific routes
 *   BASE=http://localhost:3117 OUT=./shots node scripts/screenshots.mjs
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3117";
const OUT = process.env.OUT ?? "./shots";

const ALL_ROUTES = [
  ["landing", "/"],
  ["how-it-works", "/how-it-works"],
  ["live-demo", "/live-demo"],
  ["pricing", "/pricing"],
  ["contact", "/contact"],
  ["login", "/login"],
  ["forgot-password", "/forgot-password"],
  ["set-password", "/set-password"],
  ["admin-login", "/admin/login"],
  ["devices", "/devices"],
  ["device-dashboard", "/devices/gh-1"],
  ["device-irrigation", "/devices/gh-1/irrigation"],
  ["device-alerts", "/devices/gh-1/alerts"],
  ["device-history", "/devices/gh-1/history"],
  ["device-calibration", "/devices/gh-1/calibration"],
  ["devices-add", "/devices/add"],
  ["settings", "/settings"],
  ["notifications", "/notifications"],
  ["dev-tokens", "/dev/tokens"],
];

const PHASE5_VIEWPORTS = [
  ["380", 380, 800],
  ["414", 414, 896],
  ["768", 768, 1024],
  ["1024", 1024, 768],
  ["1440", 1440, 900],
];

const DEFAULT_VIEWPORTS = [
  ["mobile-390", 390, 844],
  ["desktop-1440", 1440, 900],
];

const routes = process.env.ROUTES
  ? process.env.ROUTES.split(",").map((p) => [p.replace(/\W+/g, "_") || "root", p])
  : ALL_ROUTES;

const viewports =
  process.env.VIEWPORTS === "all" ? PHASE5_VIEWPORTS : DEFAULT_VIEWPORTS;

mkdirSync(OUT, { recursive: true });

/* Playwright ≥1.5x defaults to chrome-headless-shell, which may not be present
 * (its CDN download can fail independently of the full Chromium download).
 * `channel: "chromium"` uses the full browser instead. Override with
 * CHROME_PATH if you have a Chrome/Chromium elsewhere. */
const browser = await chromium.launch(
  process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH }
    : { channel: "chromium" },
);
const problems = [];

for (const [vpName, width, height] of viewports) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();

  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  // Name the failing URL — "404 (Not Found)" alone is not actionable.
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`HTTP ${r.status()} → ${r.url()}`);
  });

  for (const [name, path] of routes) {
    errors.length = 0;
    let res;
    try {
      /* "load", not "networkidle": these pages run a 1s interval and, in dev,
       * an HMR socket — neither ever goes idle, so networkidle just times out. */
      res = await page.goto(BASE + path, { waitUntil: "load", timeout: 45000 });
      await page.waitForLoadState("domcontentloaded");
    } catch (e) {
      problems.push(`${name} @${vpName}: navigation failed — ${e.message}`);
      continue;
    }
    await page.evaluate(() => document.fonts.ready);

    /* next/image lazy-loads anything below the fold, and Chromium's fullPage
     * capture does NOT fire IntersectionObserver for off-screen images — so
     * below-fold photos screenshot blank unless we scroll first. Scroll to the
     * bottom, back to the top, then wait for every <img> to actually decode. */
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    try {
      await page.waitForFunction(
        () =>
          Array.from(document.querySelectorAll("img")).every(
            (i) => i.complete && i.naturalWidth > 0,
          ),
        { timeout: 15000 },
      );
    } catch {
      const blank = await page.evaluate(() =>
        Array.from(document.querySelectorAll("img"))
          .filter((i) => !i.complete || i.naturalWidth === 0)
          .map((i) => i.getAttribute("src")?.slice(0, 80) ?? "(no src)"),
      );
      problems.push(`${name} @${vpName}: IMAGE never loaded: ${blank.join(", ")}`);
    }

    await page.waitForTimeout(900); // entrance animations settle

    await page.screenshot({ path: `${OUT}/${name}-${vpName}.png`, fullPage: true });

    /* Upscaled photography reads soft on the 2x screens these users are on.
     * Flag any image rendered materially larger than its intrinsic size. */
    const upscaled = await page.evaluate(() =>
      Array.from(document.querySelectorAll("img"))
        .filter((i) => i.naturalWidth > 0)
        .map((i) => {
          const r = i.getBoundingClientRect();
          return {
            src: (i.currentSrc || i.src).split("/").pop()?.slice(0, 50),
            ratio: r.width / i.naturalWidth,
            rendered: Math.round(r.width),
            natural: i.naturalWidth,
          };
        })
        .filter((x) => x.ratio > 1.25),
    );
    for (const u of upscaled) {
      problems.push(
        `${name} @${vpName}: UPSCALED ${u.src} rendered ${u.rendered}px from ${u.natural}px (${u.ratio.toFixed(1)}×)`,
      );
    }

    const audit = await page.evaluate((vw) => {
      const de = document.documentElement;
      const wide = [];
      const small = [];
      const suspiciousMaxWidth = [];

      /* DEV-011 class of bug: a named max-w-<token> utility silently resolving
       * against the WRONG theme namespace (e.g. --spacing-auth instead of
       * --container-auth) because two tokens shared a suffix. The class still
       * emits real CSS, so build/typecheck/grep-based audits see nothing wrong
       * — only a computed-layout check catches it. Heuristic: every named
       * container token in this project is >=520px; a max-w-<word> (not
       * max-w-full/none/screen/prose or a numeric/bracket value) computing
       * under 200px at a normal desktop-range viewport is almost certainly
       * this bug, not a deliberate design choice. */
      if (vw >= 700) {
        for (const el of document.querySelectorAll('[class*="max-w-"]')) {
          const cls = (el.className || "").toString();
          const named = cls.match(/max-w-([a-z][a-z0-9-]*)/);
          if (!named) continue;
          const word = named[1];
          if (["full", "none", "screen", "prose", "min", "max", "fit"].includes(word)) continue;
          const mw = parseFloat(getComputedStyle(el).maxWidth);
          if (Number.isFinite(mw) && mw > 0 && mw < 200) {
            suspiciousMaxWidth.push(`max-w-${word} computed ${Math.round(mw)}px`);
          }
        }
      }

      /* An element wider than the viewport is fine if an ancestor scrolls it —
       * that IS the handoff's designed table behaviour (min-width inside
       * overflow-x:auto). Only unscrollable overflow is a defect. */
      const inScroller = (el) => {
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
          const ov = getComputedStyle(p).overflowX;
          if (ov === "auto" || ov === "scroll") return true;
        }
        return false;
      };

      /* Inline links inside a paragraph legitimately cannot be 44px tall.
       * Only flag standalone controls: buttons, and links that are not sitting
       * inside flowing prose. */
      const isStandaloneControl = (el) => {
        if (el.matches("button,input,select,textarea,[role=button],[role=tab],[role=option]"))
          return true;
        if (!el.matches("a")) return false;
        const p = el.parentElement;
        if (!p) return false;
        const display = getComputedStyle(p).display;
        // Links inside prose (a <p>, or text-bearing block) are excluded.
        if (p.tagName === "P") return false;
        const siblingText = Array.from(p.childNodes).some(
          (n) => n.nodeType === 3 && n.textContent.trim().length > 0,
        );
        if (siblingText) return false;
        return display.includes("flex") || display.includes("grid") || display === "block";
      };

      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.height <= 0 || r.width <= 0) continue;

        if (r.width > vw + 1 && !inScroller(el)) {
          wide.push(
            `${el.tagName.toLowerCase()}[${(el.className || "").toString().slice(0, 50)}] w=${Math.round(r.width)}`,
          );
        }

        if (
          !el.hasAttribute("disabled") &&
          isStandaloneControl(el) &&
          (r.height < 44 || r.width < 24)
        ) {
          small.push(
            `${el.tagName.toLowerCase()}[${(el.textContent || "").trim().slice(0, 24)}] ${Math.round(r.width)}x${Math.round(r.height)}`,
          );
        }
      }
      return {
        scrollW: de.scrollWidth,
        clientW: de.clientWidth,
        wide: wide.slice(0, 4),
        small: small.slice(0, 8),
        smallCount: small.length,
        suspiciousMaxWidth: [...new Set(suspiciousMaxWidth)],
      };
    }, width);

    for (const s of audit.suspiciousMaxWidth) {
      problems.push(`${name} @${vpName}: SUSPICIOUS-MAX-WIDTH ${s} (DEV-011 class of bug?)`);
    }

    if (audit.scrollW > audit.clientW + 1) {
      problems.push(
        `${name} @${vpName}: H-OVERFLOW ${audit.scrollW} > ${audit.clientW}`,
      );
    }
    for (const w of audit.wide) problems.push(`${name} @${vpName}: WIDE ${w}`);
    if (audit.smallCount) {
      problems.push(
        `${name} @${vpName}: ${audit.smallCount} touch target(s) <44px high: ${audit.small.join(" | ")}`,
      );
    }
    if (res && !res.ok()) problems.push(`${name} @${vpName}: HTTP ${res.status()}`);
    for (const e of errors) problems.push(`${name} @${vpName}: CONSOLE ${e.slice(0, 140)}`);
  }

  await ctx.close();
}

await browser.close();

if (problems.length) {
  console.log(`PROBLEMS (${problems.length}):`);
  for (const p of problems) console.log("  " + p);
} else {
  console.log("no problems found");
}
console.log(`\nscreenshots → ${OUT}`);
