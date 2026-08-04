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

const browser = await chromium.launch();
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

  for (const [name, path] of routes) {
    errors.length = 0;
    let res;
    try {
      res = await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 30000 });
    } catch (e) {
      problems.push(`${name} @${vpName}: navigation failed — ${e.message}`);
      continue;
    }
    await page.waitForTimeout(900); // fonts + entrance animations

    await page.screenshot({ path: `${OUT}/${name}-${vpName}.png`, fullPage: true });

    const audit = await page.evaluate((vw) => {
      const de = document.documentElement;
      const wide = [];
      const small = [];
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.height <= 0 || r.width <= 0) continue;
        if (r.width > vw + 1) {
          wide.push(
            `${el.tagName.toLowerCase()}[${(el.className || "").toString().slice(0, 50)}] w=${Math.round(r.width)}`,
          );
        }
        const interactive =
          el.matches("a,button,input,select,textarea,[role=button],[role=tab],[role=option]") &&
          !el.hasAttribute("disabled");
        if (interactive && (r.height < 44 || r.width < 24)) {
          small.push(
            `${el.tagName.toLowerCase()}[${(el.textContent || "").trim().slice(0, 24)}] ${Math.round(r.width)}x${Math.round(r.height)}`,
          );
        }
      }
      return {
        scrollW: de.scrollWidth,
        clientW: de.clientWidth,
        wide: wide.slice(0, 4),
        small: small.slice(0, 6),
        smallCount: small.length,
      };
    }, width);

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
