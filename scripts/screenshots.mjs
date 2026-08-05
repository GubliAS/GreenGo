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
import { SignJWT } from "jose";

const BASE = process.env.BASE ?? "http://localhost:3117";
const OUT = process.env.OUT ?? "./shots";
const SESSION_COOKIE_NAME = "greengo_session";

/* Third element (optional): "tenant" | "admin" — proxy.ts requires a valid
 * session for these paths. Rather than a real login (which needs a live
 * Postgres this environment doesn't have), a session JWT is minted inline
 * with the same SESSION_SECRET the server uses, matching lib/session.ts's
 * payload shape exactly. This gets past proxy.ts for ANY protected route.
 * It does NOT substitute for a live database — the 6 routes that actually
 * call Prisma (see DEVIATIONS.md's Phase 5 note) will still error at
 * runtime without one; the rest render their still-mock Phase 2 data fully
 * once the session check passes. */
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
  // devices, device-dashboard, settings, admin-fleet, admin-devices, and
  // admin-account all call Prisma directly (see DEVIATIONS.md's Phase 5
  // note) — against the placeholder DATABASE_URL this environment has, that
  // errors immediately per-request, but running all 6 x 5 viewports back to
  // back exhausts the pg pool's connection attempts and the SERVER ITSELF
  // stops responding to anything, including unrelated routes. Excluded from
  // the automated pass; reviewed by reading the code instead (same
  // structure as their Phase 2 mock-data predecessors, already audited).
  ["device-irrigation", "/devices/gh-1/irrigation", "tenant"],
  ["device-alerts", "/devices/gh-1/alerts", "tenant"],
  ["device-history", "/devices/gh-1/history", "tenant"],
  ["device-calibration", "/devices/gh-1/calibration", "tenant"],
  ["devices-add", "/devices/add", "tenant"],
  ["notifications", "/notifications", "tenant"],
  ["admin-device-detail", "/admin/devices/gh-1", "admin"],
  ["admin-provision", "/admin/devices/provision", "admin"],
  ["admin-audit", "/admin/audit", "admin"],
  ["admin-tenants", "/admin/tenants", "admin"],
  ["admin-tenant-detail", "/admin/tenants/kwame-asante", "admin"],
  ["admin-commands", "/admin/commands", "admin"],
  ["admin-sms", "/admin/sms", "admin"],
  ["admin-config", "/admin/config", "admin"],
  ["dev-tokens", "/dev/tokens"],
];

async function mintSessionToken(role) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  const payload =
    role === "admin"
      ? { kind: "admin", userId: "test-admin-id", role: "SUPER_ADMIN", name: "Test Admin" }
      : { kind: "tenant", userId: "test-user-id", tenantId: "test-tenant-id", name: "Test Tenant" };
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(secret));
}

const sessionTokens = {
  tenant: await mintSessionToken("tenant"),
  admin: await mintSessionToken("admin"),
};

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

  for (const [name, path, role] of routes) {
    errors.length = 0;

    await ctx.clearCookies();
    if (role && sessionTokens[role]) {
      const url = new URL(BASE);
      await ctx.addCookies([
        {
          name: SESSION_COOKIE_NAME,
          value: sessionTokens[role],
          domain: url.hostname,
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
      ]);
    } else if (role && !sessionTokens[role]) {
      problems.push(`${name} @${vpName}: SKIPPED — no SESSION_SECRET set, cannot mint ${role} session`);
      continue;
    }

    let res;
    try {
      /* "load", not "networkidle": these pages run a 1s interval and, in dev,
       * an HMR socket — neither ever goes idle, so networkidle just times out. */
      res = await page.goto(BASE + path, { waitUntil: "load", timeout: 15000 });
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
