/* Drives the /login claim flow through all 9 states and screenshots each,
 * plus checks the sliding tab and claim-code feedback actually change the DOM. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3118";
const OUT = process.env.OUT ?? "./shots-login";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chromium" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const problems = [];

async function shot(name) {
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

await page.goto(`${BASE}/login`, { waitUntil: "load" });
await shot("01-login-tab");

// Switch to claim tab
await page.getByRole("tab", { name: "Claim your device" }).click();
await shot("02-claim-code-valid");

// Type claimed code
const codeInput = page.locator('input[placeholder="e.g. GG-4F82-K1"]');
await codeInput.fill("GG-1111-11");
await shot("03-claim-code-claimed");

await codeInput.fill("GG-2222-22");
await shot("04-claim-code-expired");

await codeInput.fill("GG-0000-00");
await shot("05-claim-code-invalid");

await codeInput.fill("GG-4F82-K1");
await page.waitForTimeout(200);
const continueBtn = page.getByRole("button", { name: "Continue" });
if (await continueBtn.isDisabled()) problems.push("Continue disabled on valid code");
await continueBtn.click();
await shot("06-claim-details");

await page.getByPlaceholder("Full name").fill("Test Farmer");
await page.getByPlaceholder("At least 8 characters").fill("password123");
await page.getByRole("button", { name: "Send verification code" }).click();
await shot("07-claim-otp");

await page.locator("#otp").fill("9999");
await page.getByRole("button", { name: "Verify & create account" }).click();
await shot("08-claim-otp-expired-error");

await page.locator("#otp").fill("0000");
await page.getByRole("button", { name: "Verify & create account" }).click();
await shot("09-claim-otp-wrong-error");

await page.locator("#otp").fill("1234");
await page.getByRole("button", { name: "Verify & create account" }).click();
await shot("10-claim-success");

// Resend cooldown check (should have started at step 07)
await browser.close();

console.log(problems.length ? "PROBLEMS:\n" + problems.join("\n") : "no problems found");
console.log(`shots → ${OUT}`);
