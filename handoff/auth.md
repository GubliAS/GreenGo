# Handoff spec — AUTH pages (Batch 2B)

Source: `GreenGo Login.dc.html` (one file, 2 tabs × 4 claim steps = 9 reachable
states). Plus 3 routes with **no handoff design** (DEV-005).

Copy strings verbatim and final.

---

## 1. Login / Claim → `/login`

### Shell — the page itself never scrolls, only the form column
```
height:100vh; overflow:hidden;
display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr));
grid-auto-rows:100%
```
→ `h-screen overflow-hidden grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] auto-rows-[100%]`

**Left column** — `class="gg-scroll"` (scrollbar hidden), `box-border h-full overflow-y-auto flex flex-col justify-center p-auth max-w-auth mx-auto w-full`

**Right column** — photo + rotating quote. Stacks below the form under ~600px combined width (intrinsic, via the `minmax(300px,1fr)`).

### Left column contents

1. **Logo** `Logo size="marketing" href="/"` mb `40px`
2. **Tabs** `SlidingTabs width={320}` mb `28px`, options `Log in` / `Claim your device`
3. **Tab body** wrapped in `animate-fade` + `data-gg-anim="1"`

### 1.1 Tab: Log in

- H1 `font-display` w800 `text-auth-h1 text-canopy tracking-tight` margin `0 0 8px`
  > `Log in to your dashboard`
- Para `text-md text-muted` margin `0 0 28px`
  > `Check your greenhouse, adjust thresholds, or turn on the pump.`
- Fields `flex flex-col gap-4`, `size="lg"`:
  - `Phone number` · `type="tel" inputMode="numeric"` · ph `0244 123 456` · ⚠️ handoff sets `width:220px` on **this input only** (all others are 100%) — reproduce, log if it looks wrong at 380px in Phase 5
  - `Password` · `type="password"` · ph `••••••••`
  - Link `text-sm` w600 `self-end` → `Forgot password?` → **`/forgot-password`** (handoff has `href="#"`; DEV-005 route)
  - Submit: `ButtonLink primary size=md` full-width-ish `text-center` mt `4px` → `Log in` (handoff links to Devices List and sets `localStorage.greengo_logged_in='1'`)
- Footer line `text-body text-muted` mt `28px`:
  > `No device yet? ` + link `/pricing` w600 → `Request one`

### 1.2 Tab: Claim your device — 4 steps

State: `claimStep: 'code' | 'details' | 'otp' | 'success'`

#### Step `code`
- H1 `text-auth-h1` → `Claim your first device`
- Para `text-md text-muted` margin `0 0 24px`
  > `Find the claim code printed on the sticker inside the device enclosure, or on your setup card.`
- `ClaimCodeField` (4 states, component already built). Prototype map:
  `GG-4F82-K1`→valid · `GG-1111-11`→claimed · `GG-2222-22`→expired · anything else→invalid · empty→null
- Hint `InlineHint tone="faint"`:
  > `Prototype codes — GG-4F82-K1 valid · GG-1111-11 already claimed · GG-2222-22 expired · anything else not recognised.`
- Button: `primary` when valid else `disabled`, `size=md` mt `4px` → `Continue`. Enabled **only** when state === `valid`.

#### Step `details`
- H1 `text-auth-h1` → `Set up your account`
- **Found-device strip** `bg-mint rounded-menu` pad `14px 16px` `flex justify-between items-center` mb `22px`:
  - Left: `text-micro text-ink uppercase tracking-widest` mb `3px` → `Device found`; then `font-mono text-body text-canopy` w600 → `{codeInput}`
  - Right: link `text-meta` w600 → `Change code` (returns to step `code`, clears status)
- Fields `flex flex-col gap-4`, `size="lg"`:
  - `Your name` · ph `Full name`
  - `Phone number` · `type="tel" inputMode="numeric"` · ph `0244 123 456` · **Public Sans, not mono**
  - `Set a password` · `type="password"` · ph `At least 8 characters`
  - `Button primary size=md` mt `4px` → `Send verification code`
  - Note `text-caption text-muted leading-normal`:
    > `This links the device to your account and starts calibration next.`

#### Step `otp`
- H1 `text-auth-h1` → `Verify your phone`
- Para `text-md text-muted` margin `0 0 24px`:
  > `We sent a 4-digit code by SMS to ` + `<strong class="text-canopy font-mono font-semibold">{phone}</strong>` + `.`
- OTP input: `w-40` (160px) `border-hair` `rounded-input` pad `14px` `text-26` `font-mono` `tracking-otp` (12px) `text-center`, `maxLength={4}`, `inputMode="numeric"`. Border `border-danger-border` when error, else `border-line`. onChange strips non-digits, slices to 4, clears error.
- Error line `text-sm text-danger` w600 when present.
- Verify button: `disabled` unless `otpInput.length === 4`; label `Verify & create account`
- Resend row `text-sm text-muted`:
  - `resendCooldown > 0` → `Resend available in {n}s ·` else → `Didn't get it?`
  - then link `Resend code` — when cooling down: `text-faint cursor-not-allowed pointer-events-none`
  - Cooldown starts at **30**, ticks down every 1000ms.
- Hint `InlineHint tone="faint"`:
  > `Prototype: 1234 verifies · 9999 simulates expiry · anything else is treated as incorrect.`
- Verify logic: `1234` → step `success`; `9999` → error `This code has expired — resend to get a new one.`; else → error `Incorrect code — check the SMS and try again.`

#### Step `success`
`SuccessPanel size="lg"`:
- title `Phone verified — account created`
- body `Greenhouse 1 is linked to your account. Calibration starts next.`
- action `ButtonLink primary size=md` href `/devices` → `Go to your dashboard`

### 1.3 Right column — photo + quote rotator

- Container `relative overflow-hidden bg-canopy`
- Image `public/login-greenhouse.jpg` `absolute inset-0 w-full h-full` **`opacity:.55`**, object-cover
- Scrim `absolute inset-0 bg-scrim-login`
- Content `box-border relative h-full flex flex-col justify-end p-login-photo`
- Decorative quote mark: `font-display text-quotemark leading-none text-white/16` mb `-24px` → `"`
- Quote block `key={quoteIndex}` `flex flex-col gap-5 border-l-2 border-leaf pl-7 max-w-115`, `animate-quote` + `data-gg-anim="1"`:
  - Text `font-accent italic` w400 `text-quote text-white leading-quote`
  - Attribution `text-base text-white/65 tracking-slight`
- Rotates every **7000ms**. Three quotes, all attributed `— from our field notes, KNUST greenhouse`:
  1. `The bar told me before I even walked out to check.`
  2. `Ten seconds apart, every reading — the LCD never stops counting.`
  3. `The pump turned on before I even reached for my phone.`

**Accessibility note (additive):** the rotator must be pausable or marked `aria-hidden` for the decorative mark; the quote itself should sit in a `role="status"` region rather than announcing every 7s. Handoff has no guidance — log the choice.

---

## 2. `/forgot-password` — NO HANDOFF DESIGN (DEV-005)

Compose from the Login shell + the claim flow's OTP step. Proposed 3 steps:
1. **Identify** — `Phone number` field + `Send reset code`. Response must be identical whether or not the account exists (no enumeration — Phase 4B).
2. **OTP** — reuse the step-`otp` treatment verbatim, including the 30s resend cooldown and both error strings.
3. **New password** — see `/set-password` below.

Reuse: left column shell, `SlidingTabs` omitted (single flow), photo column, `Logo`.

## 3. `/set-password` — NO HANDOFF DESIGN (DEV-005)

Extracted from the claim `details` step's password field. Fields: `New password` (ph `At least 8 characters`) + `Confirm password`. Then `SuccessPanel` → `Go to your dashboard`.

## 4. `/admin/login` — NO HANDOFF DESIGN (DEV-005)

Login shell, but:
- `Logo size="app" withAdminBadge asLink={false}` instead of the marketing logo
- No claim tab, no "No device yet?" footer line
- Identifier is **email** (`ops@greengo.dev` is the seeded admin), not a phone — admins are not tenants. ⚠️ This diverges from the product's phone-first rule; the handoff's Admin Account Settings screen shows an `Email` field, which is the evidence for it.
- Redirect target `/admin`
- Photo column: reuse `login-greenhouse.jpg`

---

## Cross-page notes

- The handoff persists login via `localStorage.greengo_logged_in`. Phase 2B keeps that as a mock so the nav's `Dashboard` label is reachable; Phase 4B replaces it with the httpOnly session cookie.
- All three DEV-005 auth routes must appear in the Phase 6 manifest walk.
