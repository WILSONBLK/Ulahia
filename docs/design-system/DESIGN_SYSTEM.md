# Ulahia Design System v1.0

**Status:** Foundation — approved for implementation
**Owner:** Design Systems
**Applies to:** All screens, all components, all future feature work
**Relationship to codebase:** This document is the target state. The current codebase (`src/index.css`, plain CSS custom properties, Arial fallback font, 8px radii) is the starting point. Section 0 documents the gap and the migration path. Do not treat divergence from this spec in existing CSS as intentional — it is debt to close, not precedent to follow.

---

## 0. How This Document Relates to the Existing App

Ulahia already ships. Before any screen work happens, be precise about what exists today versus what this system defines as the target, so implementation is a migration, not a rewrite.

| Area | Current state (as of this document) | Target (this spec) |
|---|---|---|
| Styling approach | Plain CSS, custom properties on `:root`, BEM-ish class names (`.pos-product-row`, `.co-mode-btn`) | Same approach, kept — no framework migration implied. Token set expanded and renamed to semantic scale (see §2) |
| Font | `Arial, Helvetica, sans-serif`, no weight scale beyond 700/800/900 ad hoc | Manrope (headings/display) + Inter (body/UI), per Brand Board |
| Radius | Flat `8px` almost everywhere, a few `10–22px` one-offs | 4-step scale (`sm/md/lg/xl` = 8/12/16/24px), applied by component type, not ad hoc |
| Color tokens | 11 raw variables (`--ink`, `--muted`, `--line`, `--bg`, `--panel`, `--green`, `--green-2`, `--yellow`, `--red`, `--blue`, `--shadow`) | Full semantic token set layered on top of the same brand palette (§2, §3) |
| Dark mode / High contrast | Already implemented via `.app--dark` / `.app--hc` class overrides on the same custom properties | Preserved mechanism, extended token coverage |
| Currency format | `NGN 12,345` via `toLocaleString('en-NG')` in `utils.js` | Standardize on `₦` symbol + tabular figures, see §4.5. This is a real behavior change — flag to engineering before applying broadly, since it touches receipts already sent to customers |
| Languages | English, Yoruba, Igbo, Hausa implemented in `lang.js` | Same four languages remain the scope for typography/localization rules (§4.6) |

**Migration principle:** new tokens are additive. Existing class names stay; their declarations get re-pointed at semantic tokens. Nothing in this spec requires renaming component classes or restructuring the CSS architecture — it requires enriching the token layer underneath it.

---

## 1. Design Philosophy

### 1.1 Visual Philosophy

Ulahia's user is a shop owner in a market or neighbourhood store — often standing, often interrupted mid-transaction, often using a lower-mid-range Android phone in direct sunlight. The visual language exists to serve that person, not to impress a designer's portfolio.

- **Legible over decorative.** Every visual choice is judged first by "can this be read in 0.3 seconds on a cracked screen in daylight," not by aesthetic novelty.
- **Warm, not corporate.** The palette (deep teal, terracotta, fresh lime) and the illustration style (real Nigerian market life, not abstract blob mascots) signal "built for you," not "built by a bank." Corporate SaaS blues, glassy fintech gradients, and crypto-style neon are explicitly excluded — they signal extraction, not partnership.
- **Confidence through restraint.** One accent color per screen state. One primary action per screen. Calm whitespace over dense dashboards. A shop owner should never feel like they're being sold something inside their own tool.
- **Honesty in data presentation.** Numbers are never rounded for prettiness, never animated in ways that obscure the real value, and losses/debts are shown in red without euphemism.

### 1.2 UX Philosophy

- **One primary path per screen.** Every screen has exactly one obvious next action (Sell button on Home, Checkout button on POS, Complete Sale on Checkout). Secondary actions are visually subordinate.
- **Interruption-safe.** Because the user is often interrupted (a customer walks up, a phone call comes in), state must never be silently lost. Carts, half-filled forms, and in-progress checkouts persist until explicitly cleared.
- **Offline is a first-class state, not an error state.** The product must never treat "no internet" as a failure to apologize for — it's the default operating condition for the target user. Offline banners inform, they don't alarm.
- **Progressive disclosure.** Advanced features (bulk restock, multi-customer order tabs, flexible pricing) stay out of the primary flow until needed. The default view is always the simplest one.
- **Numbers before words.** Where a screen's job is financial truth (Home summary, Reports, Checkout total), the number is the largest, boldest element on the screen — larger than any label or heading.

### 1.3 Interaction Philosophy

- **Thumb-first.** Primary actions live in the bottom half of the screen or in a persistent bottom bar. This is a one-handed, standing-up product.
- **Confirm destructive, don't confirm routine.** Deleting a product or clearing a cart asks for confirmation. Adding an item to cart or opening a screen does not — friction is spent only where a mistake is costly.
- **Immediate, visible feedback.** Every tap produces a state change within 100ms (a pressed state, a color change, a toast) even if the underlying operation (sync) takes longer.
- **No dead ends.** Every modal, every error, every empty state offers a next action. Never show a wall of text with no button.

### 1.4 Accessibility Philosophy

Ulahia's users skew toward older shop owners, variable literacy, and low-end Android devices with small, sometimes damaged screens. Accessibility here is not a compliance checkbox — it is core usability for the actual target user.

- Design for **AAA contrast on financial numbers and primary actions**, AA minimum everywhere else.
- **Touch targets are never smaller than 48×48px**, and primary actions target 52–60px — this matches the current implementation's `min-height: 52px` convention and should stay the floor, not the ceiling.
- **Icons are always paired with text labels** in navigation and primary actions — never icon-only for anything critical to the transaction flow. (This product is not built for people who grew up with app iconography as a second language.)
- **Large text mode** must not break layouts — components are specified with flexible heights, not fixed pixel heights, wherever text can reflow.
- Dark mode and High Contrast mode are supported product-wide, not applied selectively (both already exist in the codebase as `.app--dark` and `.app--hc`).

---

## 2. Design Tokens

Tokens are the single source of truth. Components reference tokens; tokens never reference components. Three layers, matching how Carbon/Polaris structure theirs:

1. **Global tokens** — raw values (`teal-700`, `space-4`). Rarely referenced directly by components.
2. **Semantic (alias) tokens** — meaning-based names (`color-surface-primary`, `text-danger`). This is what components use.
3. **Component tokens** — component-specific overrides, used only when a component needs to diverge from the semantic default (e.g. `button-primary-bg` normally equals `color-brand-primary`, but can be repointed independently).

Naming convention: `category-role-variant-state`, all lowercase, hyphen-separated. Examples: `color-text-muted`, `color-surface-danger-subtle`, `radius-lg`, `motion-duration-fast`.

### 2.1 Color Tokens (semantic layer)

| Token | Light value | Dark value | Maps to current CSS var |
|---|---|---|---|
| `color-brand-primary` | `#0F6B63` (Deep Teal) | `#12D89A`-adjacent, see §3.4 | `--green` (currently `#087f5b` — see §3 for reconciliation) |
| `color-brand-secondary` | `#C24E2A` (Terracotta) | tinted for dark | *(new — not yet in codebase)* |
| `color-brand-accent` | `#7BC943` (Fresh Lime) | tinted for dark | `--green-2` region |
| `color-text-primary` | `#17211D` | `#E8F0EC` | `--ink` |
| `color-text-muted` | `#61736A` | `#8AADA0` | `--muted` |
| `color-text-inverse` | `#FFFFFF` | `#17211D` | — |
| `color-text-danger` | `#E03131` | `#FF6B6B` | `--red` |
| `color-text-success` | `#22C55E`-family | tinted | `--green-2` |
| `color-border-default` | `#DBE6DF` | `#2A3830` | `--line` |
| `color-border-strong` | `#A8B6AE` | `#3D4E44` | *(new)* |
| `color-surface-page` | `#F6FAF7` | `#111A15` | `--bg` |
| `color-surface-card` | `#FFFFFF` | `#1A2720` | `--panel` |
| `color-surface-sunken` | `#F8FBF9` | `#15201A` | ad hoc `#f8fbf9` literals |
| `color-surface-brand-subtle` | `#E6FCF5` | dark-tinted | ad hoc `#e6fcf5` literals |
| `color-surface-warning-subtle` | `#FFF9DB` | dark-tinted | ad hoc `#fff9db` literals |
| `color-surface-danger-subtle` | `#FFF0F0` | dark-tinted | *(new)* |
| `color-success` | `#22C55E` | `#2FE07A` | — |
| `color-warning` | `#F97316` | `#FDBA74` | `--yellow` region (reassigned, see §3.3) |
| `color-danger` | `#E5484D` | `#FF6B6B` | `--red` |
| `color-info` | `#4F6FEB` | `#7B93F5` | `--blue` |
| `color-offline` | `#687280` | `#8B95A3` | *(new — currently reuses warning yellow, should be distinct, see §3.3)* |

### 2.2 Typography Tokens

See §4 for full scale. Token pattern: `font-{role}-{size}` e.g. `font-heading-1`, `font-body-large`, `font-financial-lg`.

### 2.3 Spacing Tokens (8pt grid)

| Token | Value |
|---|---|
| `space-0` | 0px |
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-16` | 64px |

Rule: only 4px is used as a sub-unit for tight internal component spacing (e.g. icon-to-label gap). Everything else snaps to multiples of 8.

### 2.4 Radius Tokens

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 8px | inputs, small buttons, chips, pills use `radius-full` instead |
| `radius-md` | 12px | list rows, secondary cards |
| `radius-lg` | 16px | primary cards, modals, product tiles — matches Brand Board's `16px` spec |
| `radius-xl` | 24px | hero cards, the big Sell CTA, bottom sheets (top corners only) |
| `radius-full` | 999px | pills, chips, avatars, badges |

**Migration note:** current CSS uses flat `8px` almost everywhere including cards and modals. Target state moves cards/modals to `radius-lg` (16px) per the Brand Board's explicit "Border Radius: 16px" spec. Buttons and inputs stay at `radius-sm` (8px).

### 2.5 Elevation Tokens

| Token | Shadow | Usage |
|---|---|---|
| `elevation-0` | none | flat surfaces, page background |
| `elevation-1` | `0 2px 8px rgba(23,33,29,0.04)` | cards resting on the page (product cards, list rows) |
| `elevation-2` | `0 16px 38px rgba(23,33,29,0.10)` | floating elements above content (sticky checkout bar, dropdowns) — matches existing `--shadow` |
| `elevation-3` | `0 18px 38px rgba(23,33,29,0.22)` | modals, bottom sheets — the highest layer, reserved for anything that blocks interaction with the page underneath |

Only 3 levels exist, by design (see §12 Design Rules — "never use more than two elevation levels inside one section").

### 2.6 Motion Tokens

| Token | Value |
|---|---|
| `motion-duration-instant` | 100ms |
| `motion-duration-fast` | 150ms |
| `motion-duration-base` | 220ms |
| `motion-duration-slow` | 400ms |
| `motion-easing-standard` | `cubic-bezier(0.2, 0, 0, 1)` |
| `motion-easing-decelerate` | `ease-out` |
| `motion-easing-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` (already used for the DemoPractice celebration box) |

### 2.7 Opacity Tokens

| Token | Value | Usage |
|---|---|---|
| `opacity-disabled` | 0.45 | disabled controls (matches existing `.pos-product-row.out-of-stock`) |
| `opacity-muted` | 0.7–0.85 | secondary icon/text emphasis inside colored surfaces |
| `opacity-overlay` | 0.5 | modal backdrop |
| `opacity-overlay-strong` | 0.82 | celebration/full-screen takeover backdrops |

### 2.8 Border Tokens

| Token | Value |
|---|---|
| `border-width-default` | 1px |
| `border-width-emphasis` | 2px (used for active states: qty stepper, mode toggle, active order tab) |
| `border-style-dashed` | used only for "add new / optional" affordances (flexible price trigger, add-customer tab) — never for structural borders |

---

## 3. Color System

### 3.1 Palette Source

Primary: Deep Teal `#0F6B63`, Terracotta `#C24E2A`, Fresh Lime `#7BC943` (Brand Board, §Color Palette). Neutrals: Warm Ivory `#FAF8F1`, Stone `#E7E5E1`, Warm Gray `#A8A6A1`, Graphite `#33363A`, Charcoal `#1E1F22`.

**Reconciliation needed:** the current codebase's `--green: #087f5b` is close to but not identical to the Brand Board's Deep Teal `#0F6B63`. Recommendation: adopt `#0F6B63` as `color-brand-primary` going forward and treat `#087f5b` as deprecated — it's a ~15-year-old "Google-teal" that reads as generic, whereas `#0F6B63` reads as the intentional, warmer teal the brand board specifies. This is a visible but small shift; confirm with stakeholder before a global find-replace since it touches every screen.

### 3.2 Usage Rules by Role

- **Primary (Deep Teal)** — the single color of action. Primary buttons, active nav state, active toggle, the Sell CTA, focus rings. Never used decoratively (no teal-colored illustrations backgrounds, no teal section dividers "just because").
- **Secondary (Terracotta)** — reserved for the second brand touchpoint: onboarding accents, empty-state illustrations, the brand mark's roof/accent shapes. Not used for interactive states — terracotta buttons would compete with teal primary buttons and break the "one primary action" rule.
- **Accent (Fresh Lime)** — success/growth signals only: profit-up indicators, progress bar fills, "you're on track" moments. This is what makes Reports feel optimistic rather than clinical.
- **Surface/Background/Border** — structural, never decorative. Background (`color-surface-page`) is the canvas; Card (`color-surface-card`) sits one level up; Sunken (`color-surface-sunken`) is for content nested inside a card (e.g. a receipt line list).
- **Semantic (success/warning/danger/info)** — reserved exclusively for status communication: stock levels, transaction outcomes, offline state, sync state. A red pill always means "needs attention/negative," never "this item is featured."

### 3.3 A Correction to the Current Implementation

Today, `--yellow: #ffd43b` is used both for genuine "warning" (low stock) and is visually adjacent to the offline banner's `#fff3bf` background. This conflates two different signals: **"something needs your attention soon" (warning)** vs **"you have no internet right now" (offline/neutral-info)**. Recommendation: give offline state its own neutral-blue-gray token (`color-offline`, §2.1) distinct from warning-yellow, so a shop owner scanning the screen can tell "low stock" apart from "no signal" at a glance. This is a one-line CSS change, not a redesign.

### 3.4 Dark Mode

Dark mode is not "invert the colors" — it's a deliberately re-lit palette. Rules:
- Brand primary teal shifts brighter/more saturated in dark mode (`#0CA678` → target `#12D89A` family) because desaturated colors recede against dark backgrounds and would read as disabled.
- Surfaces step *up* in lightness as elevation increases (page `#111A15` → card `#1A2720` → modal `#1E2E27`), the opposite of light mode's shadow-based elevation — this is already correctly implemented in the codebase and should be preserved as the model.
- Never pure black backgrounds (`#000`) — always a dark, slightly green-tinted charcoal, consistent with the brand's warmth.
- Semantic colors (danger, warning) get slightly desaturated/lightened versions so they don't vibrate against the dark surface.

### 3.5 High Contrast

High contrast mode (`.app--hc`) is a distinct, tested mode — not just "turn up the contrast slider." Rules:
- Pure black text (`#000000`) on pure white (`#FFFFFF`).
- Borders double in width (1px → 2px) so structure doesn't rely on subtle color alone.
- Brand teal darkens to `#005A3C` — still identifiably "Ulahia green" but hits AAA against white.
- Shadows shrink and darken — elevation in HC mode is communicated primarily through borders, not soft shadows, since shadows are a contrast-dependent affordance.

---

## 4. Typography

### 4.1 Font Families

- **Manrope** — Display, Headings (H1–H3). Manrope's geometric warmth matches the brand's "friendly but confident" personality and pairs with the house-shaped logomark.
- **Inter** — Body text, UI labels, buttons, inputs, H4–H6. Inter is chosen over Manrope for body copy because its lower-case letterforms and numeral spacing hold up better at small sizes on low-DPI Android screens — this is a legibility decision, not a variety decision.
- **Fallback stack:** `'Inter', 'Manrope', -apple-system, 'Segoe UI', Roboto, Arial, sans-serif` — Arial remains in the stack as the terminal fallback for feature-phone-adjacent browsers, but is no longer the primary typeface.

**Action required:** current `body { font-family: Arial, Helvetica, sans-serif }` must be updated to load Manrope/Inter (self-hosted or via `<link>`, not a CDN dependency that fails offline — this app must render its fonts without a network connection, so fonts should be bundled as static assets, not fetched from Google Fonts at runtime).

### 4.2 Type Scale

| Token | Size | Weight | Line height | Usage |
|---|---|---|---|---|
| `font-display` | 32–44px (clamp) | 800 (Manrope) | 1.1 | Landing/marketing hero only |
| `font-heading-1` | 28px | 800 | 1.15 | Screen titles (Reports, Products) |
| `font-heading-2` | 22px | 800 | 1.2 | Section headers |
| `font-heading-3` | 18px | 700 | 1.25 | Card titles, modal titles |
| `font-body-large` | 17px | 400/600 | 1.5 | Primary reading text, list row primary line |
| `font-body-small` | 14px | 400/600 | 1.45 | Secondary/meta text (`var(--muted)` lines) |
| `font-label` | 14px | 800 | 1.3 | Form labels, section kickers — uppercase, `0.04–0.05em` tracking |
| `font-caption` | 12px | 700 | 1.3 | Chip text, badges, timestamps |
| `font-financial-sm` | 18px | 900 | 1.2 | Inline amounts in lists |
| `font-financial-lg` | 28–32px | 900 | 1.1 | Hero totals (Home summary, Checkout total, Receipt total) |

Base body size stays at **17px** (already correct in the codebase — larger than typical web default 16px, appropriate for the target user's reading distance and eyesight).

### 4.3 Weights

Only three weights are used product-wide: **400 (regular body text), 700 (emphasis/labels), 800–900 (headings, financial numbers, primary buttons)**. Do not introduce 300, 500, or 600 — the current codebase already leans on 700/800/900 almost exclusively, which is correct for a "confident, not delicate" feel; keep it that way rather than adding a finer gradation that would soften the tone.

### 4.4 Letter Spacing

- Body text: `0` (default) — matches current implementation.
- Uppercase labels/kickers: `0.04–0.05em` — needed for legibility since uppercase Manrope/Inter at small sizes reads cramped without it (already applied to `.co-label`).
- Display/heading: `0` to slightly negative (`-0.01em`) at the largest sizes only, standard optical correction.

### 4.5 Financial Number Formatting

This is a dedicated rule set because money is the product's core trust signal.

- **Always tabular figures** (`font-variant-numeric: tabular-nums`) on any number that appears in a list, table, or anywhere amounts stack vertically — so digits align column-wise. Apply this token-level, via `font-financial-*` tokens, not per-instance.
- **Currency symbol: `₦`**, not the `"NGN "` string prefix currently used in `utils.js`. The Brand Board mockups consistently show `₦` — it's more compact, unambiguous to the target market, and reads faster in a list. Recommendation: change `formatMoney`/equivalent in `utils.js` to output `₦12,345` (no space, tabular). **Flag this to engineering explicitly** — it changes text already sent to customers via WhatsApp receipts, so coordinate the rollout rather than treating it as a pure style tweak.
- Thousands separator: comma, per `en-NG` locale — keep `toLocaleString('en-NG')` as the formatting mechanism, only the symbol/prefix changes.
- Never truncate or abbreviate currency (no "₦12.3k") — a shop owner's trust depends on seeing the exact figure, always.
- Negative/debt amounts: red (`color-text-danger`) with a leading `-`, never parentheses (parentheses-for-negative is an accounting convention the target user won't reliably parse).
- Profit-positive amounts may use `color-success`/lime accent sparingly (e.g. Reports "vs yesterday ↑12%"), but the primary total amount itself stays `color-text-primary` (near-black), not colored — color is reserved for the *delta*, not the base number, so it doesn't look like a coupon or a promo.

### 4.6 Language Considerations

Ulahia ships English, Yoruba, Igbo, and Hausa (`src/lang.js`). Typographic implications:

- Yoruba and Igbo use diacritics (e.g. underdots, tonal marks) that Manrope/Inter must render correctly at all weights — verify glyph coverage before final font-file selection; do not silently fall back to a different font for diacritic characters, which would look broken mid-sentence.
- Translated strings run 20–40% longer than English in this language set typically (Hausa and Yoruba UI strings tend to be longer) — all button and label components must be designed with flexible width/height, never fixed pixel dimensions with `overflow: hidden` on critical actions like the Sell CTA or Checkout button.
- Numerals and currency format stay Western/Arabic numerals and `₦` symbol across all four languages — do not localize the number system itself.
- Keep the language switcher itself always in the *target* language's own name (e.g. "Yorùbá," "Hausa," "Igbo") in the dropdown, never translated into the current UI language — this is standard practice and already implicit in a `.setup-lang` / `.home-lang` selector.

---

## 5. Layout System

### 5.1 Grid

Ulahia is fundamentally a **mobile-first, single-column product**. The existing `.layout` container (`grid-template-columns: 1fr`, max-width `1220px`) with a `.two-col` variant for desktop is the correct model — extend it, don't replace it.

- **Mobile (< 560px):** single column, full-bleed sections, `16px` side padding (`clamp(14px, 4vw, 34px)` already in use is good — keep it).
- **Tablet (560–920px):** single column content, but grids of cards move from 1 to 2 columns (`.stats`, `.grid`, `.home-grid` already do this).
- **Desktop (> 920px):** two-column layouts activate where content supports it (Home hero + phone preview, Products list + detail panel); primary content caps at `1220px` centered.

### 5.2 Spacing & Containers

- Page-level padding: `space-4` (16px) mobile → `space-6`–`space-8` desktop, via `clamp()`, matching existing pattern.
- Card internal padding: `space-4` (16px) standard, `space-3` (12px) for dense list rows.
- Gap between stacked sections: `space-6` (24px)... this is already `.section { margin-top: 22px }` — round up to 24px for grid consistency.
- Bottom nav clearance: content must always reserve `70–90px` at the bottom of scrollable views (already implemented via `.pos-screen { padding-bottom: 70px }` and `.layout { padding: ... 90px }`) — keep this as a hard rule for every new full-height screen, since the fixed bottom nav overlaps content otherwise.

### 5.3 Safe Areas

- Bottom navigation and sticky checkout bars must respect `env(safe-area-inset-bottom)` on iOS notch/home-indicator devices (not currently handled in the codebase — add when iOS wrapper/PWA install is prioritized).
- Sticky headers (`.topbar`, `.pos-header`) respect `env(safe-area-inset-top)` similarly.

### 5.4 Responsive Behavior Rule

Never redesign a screen's information hierarchy between breakpoints — only reflow columns and adjust spacing. A user resizing a window (e.g. Android split-screen) should never see content reordered or removed, only re-wrapped. This is already the pattern in the existing media queries (`grid-template-columns` changes, not element reordering) — continue it.

---

## 6. Elevation

### 6.1 Shadow System

Three levels only (§2.5). Rationale for the cap: stacking more than three levels of shadow in a single-color, mostly-white UI creates murky, ambiguous depth — worse than no shadow at all on the low-end displays this product targets, where shadow anti-aliasing is often poor.

### 6.2 Card Hierarchy

- Resting cards (product rows, customer cards, list items): `elevation-1`.
- Cards that need to stand out from a list of peers (a highlighted "today's summary" card, an alert card): `elevation-1` + a colored left border or subtle tinted background — not a heavier shadow. Emphasis is communicated by color/border, not by shadow weight.

### 6.3 Floating Hierarchy

- Sticky bars (POS checkout bar, sticky modal headers): `elevation-2`.
- Dropdowns/autocomplete panels (`.cs-dropdown`): `elevation-2`.
- Toasts: `elevation-2` on a dark surface (already `--shadow` in current CSS).

### 6.4 Modal Hierarchy

- Standard modals, bottom sheets, full-screen takeovers (celebration overlay): `elevation-3`, always paired with a scrim (`opacity-overlay` 0.5, or `opacity-overlay-strong` 0.82 for full-attention takeovers like the DemoPractice celebration).
- Never stack two `elevation-3` surfaces simultaneously (no modal-over-modal) — if a confirmation is needed on top of a modal, it replaces the modal's content in place (as `.pos-order-tab--confirm`'s inline confirm pattern already does) rather than opening a second modal.

---

## 7. Component Library

Each component below follows: Purpose · Variants · Sizes · States · Interaction · Accessibility · Usage · Do's/Don'ts. Where the component already exists in the codebase, its current class name is noted so engineering can map spec → implementation directly.

### 7.1 Buttons
*(existing: `.button`, `.button.secondary`, `.button.light`, `.sale-button`, `.checkout-btn`, `.co-complete-btn`)*

**Purpose:** Trigger a single, unambiguous action.

**Variants:**
- Primary — solid `color-brand-primary` fill, white text. The Sell/Checkout/Complete-Sale family.
- Secondary — tinted background (`color-surface-brand-subtle`) + primary-colored text. Supporting actions on a screen that already has a primary button.
- Ghost — transparent background, bordered, ink-colored text (`.button.light`). Neutral actions (Cancel, Back).
- Text — no background, no border, primary-colored text. Lowest-emphasis actions (Skip, "See all").
- Danger — solid `color-danger` fill or danger-colored ghost. Destructive confirmations only (Delete product, Clear cart).

**Sizes:** Large (56–60px, full-width mobile CTA), Default (52px, matches current `min-height: 52px`), Compact (44px, inline actions like qty-stepper-adjacent buttons).

**States:** default, pressed (`transform: scale(0.97–0.985)` + shadow reduction, already implemented on `.sell-cta`/`.home-tile`), disabled (`opacity-disabled`, no shadow, cursor not-allowed), loading (label replaced by a spinner, button stays same size — never shrinks/grows on loading).

**Interaction:** immediate pressed-state feedback (< 100ms). No hover-dependent affordance (touch-first product) — hover states exist only as harmless enhancement for the eventual desktop/web version.

**Accessibility:** minimum 48×48px hit target even for compact size (padding compensates if visual size is smaller); disabled buttons still announce their label and disabled state; never convey button meaning by color alone — danger buttons carry a label like "Delete," not just red color.

**Do:** one primary button per screen/modal. Pair icon+label for anything ambiguous.
**Don't:** never place two primary (solid) buttons side-by-side — demote one to secondary/ghost. Never use terracotta or lime for buttons (reserved per §3.2).

### 7.2 Inputs
*(existing: `.field`, `.select`, `.flex-amount-input`)*

**Purpose:** Capture structured user data.

**Variants:** Text Field, Search (with leading icon, matches `.pos-search`), Currency Input (right-aligned, tabular, `₦` prefix, matches `.flex-amount-input` pattern), Phone Input (numeric keypad trigger via `inputmode="tel"`), Dropdown/Select, PIN Input (see 7.16), Barcode Input (see 7.17).

**Sizes:** single standard height, `min-height: 52px` — inputs do not have a "compact" variant; this product never needs dense data-entry tables.

**States:** default, focused (2px `color-brand-primary` border replacing 1px default), filled, error (border → `color-danger`, helper text below in danger color), disabled.

**Interaction:** numeric fields always trigger the numeric keyboard on mobile (`inputmode="numeric"` / `type="tel"` as appropriate) — this is a frequent real-world failure point (bringing up the full QWERTY keyboard for a price field wastes the user's time every single sale).

**Accessibility:** every input has a visible `<label>` (never placeholder-as-label); error messages are programmatically associated (`aria-describedby`) for the future web/screen-reader path.

**Do:** right-align numeric/currency values. Show units/currency as a fixed affix, not part of the editable value.
**Don't:** never use placeholder text as the only label. Never auto-submit on a partial numeric entry.

### 7.3 Cards
*(existing: `.card`, `.stat`, `.prod-row`, `.cust-card`, `.report-card`)*

**Purpose:** Group related information as one visual/tap unit.

**Variants:**
- **Summary Card** — a single stat + label, used in dashboards/reports grids (`.stat`, `.dash-today-card`).
- **Product Card** — name, stock pill, price, action button (`.prod-row`, `.pos-product-row`).
- **Customer Card** — avatar initial, name, phone, debt amount, last-payment note (`.cust-card`).
- **Debt Card** — customer + outstanding balance + recovery affordance (`.debt-row`, `.flex-prod-card` for recovery tracking).
- **Report Card** — a chart or metric block with a time-range context.

**Sizes:** cards do not have a fixed height — they size to content, with a `min-height` floor matching the touch-target rule (58px+ for tappable rows).

**States:** default, pressed (tappable cards only, e.g. `.home-tile`), warning (tinted border/background for low stock, `.stat.warn`), selected (bordered in primary color, used for order tabs).

**Interaction:** an entire card is the tap target when the card is navigational (Home tiles); when a card contains its own internal actions (Customer Card's call/WhatsApp buttons), the card body itself is not separately tappable to avoid overlapping hit areas.

**Accessibility:** card as a whole exposes one accessible name summarizing its content for screen readers (e.g. "Chinedu Ike, owes ₦15,400, tap to view").

**Do:** keep to 2–3 pieces of information at rest; push detail to a detail view/modal.
**Don't:** never exceed roughly 4 distinct data points visible on a resting card (density cap, see §12).

### 7.4 Search
*(existing: `.pos-search`, `.customer-search` + `.cs-dropdown`)*

**Purpose:** Fast lookup within a large list (products, customers) — this is a "search while a customer is waiting" component, so speed matters more than exhaustive filtering UI.

**Variants:** Inline search bar (POS), Autocomplete-with-dropdown (Customer Search, allows "create new" inline).

**States:** empty, typing (results filter live, no explicit "search" button/submit), results, no-results (offers "create new" where applicable, per `.cs-new`), loading (rare, only if searching a large synced dataset).

**Interaction:** debounce is not needed for local/offline data (instant filter); if a future server-side search is added, debounce at 250–300ms (`motion-duration` range).

**Accessibility:** results list is keyboard-navigable (future web); each result row is a real button, not a styled div.

**Do:** always show a clear/cancel affordance once text is entered.
**Don't:** never require a minimum character count before showing any result — even one character should filter.

### 7.5 Dropdowns
*(existing: `.select`)*

**Purpose:** Choose one value from a small, known set (category filter, language, payment mode is actually a toggle not a dropdown — see 7.9).

Native `<select>` is intentionally kept (not a custom-styled listbox) for the primary implementation — native selects get free OS-level accessibility, larger touch targets, and better performance on low-end Android than JS-driven custom dropdowns. Only build a custom dropdown component when a native select cannot express the need (e.g. multi-select, rich rows with icons).

### 7.6 Product / Customer Cards
Covered under 7.3 — kept as a single "Cards" spec rather than a separate section, since their anatomy (leading visual, title, meta line, trailing value/action) is one shared pattern with data-specific content.

### 7.7 Charts
*(new — Reports screen)*

**Purpose:** Show trend, not precision — the exact number lives in an adjacent Summary Card; charts communicate direction and pattern only.

**Variants:** Line/area chart (Revenue over time), Bar chart (category comparison), Progress ring/bar (Recovery Tracker, already patterned via `.recovery-bar-fill`/`.progress`).

**Color:** one data series per chart uses `color-brand-primary`; a second comparison series (e.g. "this month vs last month") uses `color-brand-secondary` (terracotta) at reduced opacity — never more than 2 series on one chart at this product's information density.

**Accessibility:** every chart is backed by the same data in an accessible table/list form (a "view as list" affordance) — charts are a supplement, never the only way to read the number, since precise financial data must always be available to low-vision users.

**Do:** label axes in the current language; keep gridlines minimal (`color-border-default` at reduced opacity).
**Don't:** never use more than 2 colors in one chart; never omit numeric labels in favor of "just the shape."

### 7.8 Tables
*(new — used sparingly; Transaction History, Bulk Restock)*

Ulahia mostly avoids dense tables in favor of card-lists (better for touch, better for translated text of variable length). Where a true table is unavoidable (Bulk Restock's multi-row quantity entry), rules:
- Row height ≥ 52px (touch target floor).
- Currency/number columns right-aligned, tabular.
- Horizontal scroll (not column compression) is the responsive strategy on narrow screens — never shrink font size to fit more columns.

### 7.9 Lists
*(existing: `.list`, `.list-row`, `.debt-row`, `.txn-row`, `.expense-row`, `.prod-row`)*

**Purpose:** the default content pattern for this product — most screens are, fundamentally, a list.

**Anatomy:** leading element (icon/avatar/none) → primary line (bold) → secondary line (muted, smaller) → trailing value/action (right-aligned, often the money value or a status pill).

**States:** default, pressed, swipe-actions (future — not yet implemented; if added, reveal max 2 actions, e.g. Edit/Delete).

**Do:** consistent row height within one list. Consistent trailing-content alignment (always right edge).
**Don't:** never mix card-style rows and borderless rows in the same list.

### 7.10 Modals
*(existing: `.modal-backdrop`, `.modal`, `CheckoutModal.jsx`, `RestockModal.jsx`)*

**Purpose:** focused, blocking tasks that need to interrupt the current screen (Checkout, Restock, Add Product, Confirm Delete, PIN Gate).

**Variants:** Standard modal (centered, `radius-lg`, max-width 560px), Full-height sheet-modal on mobile (Checkout already behaves this way via sticky header/footer), Confirm dialog (small, 1–2 sentence body + 2 buttons).

**Sizes:** modal width caps at `560px` desktop, full-width-minus-padding on mobile.

**States:** entering (fade+scale in, `motion-duration-base`), open, exiting.

**Interaction:** backdrop tap dismisses non-destructive modals; destructive/data-entry modals (Checkout, mid-form Add Product) require an explicit Cancel/Back tap to avoid accidental data loss from a stray tap.

**Accessibility:** focus traps inside the modal while open (future web requirement); Escape key closes (future web); on mobile, hardware/gesture back button closes the topmost modal only.

**Do:** sticky header with a clear title + back/close affordance for any modal taller than the viewport (`.co-header` pattern).
**Don't:** never modal-over-modal (§6.4).

### 7.11 Bottom Sheets
*(new pattern — recommended for mobile-native contexts, e.g. a future "quick actions" sheet)*

**Purpose:** lightweight alternative to a full modal for short, single-purpose choices (e.g. "Share receipt via...").

**Anatomy:** rounded top corners only (`radius-xl` top-left/top-right, 0 bottom), drag handle affordance, max height 90vh with internal scroll.

**Interaction:** swipe-down-to-dismiss + backdrop tap. Reserve for genuinely lightweight choices — anything with form inputs should be a full modal, not a sheet, since sheets imply "quick and reversible."

### 7.12 Navigation
*(existing: `.tabs-mobile`, `.nav-button`, `.topbar`, `BottomNav.jsx`, `TopBar.jsx`)*

**Bottom Navigation:** fixed, 6 destinations max (current: Home, Sell, Products, Customers, Reports, More/Settings pattern), icon+label always paired, active state = `color-brand-primary` icon+label (not a filled pill background — keep it clean per current `.tabs-mobile button.is-active`), badge support for cart count (`.cart-badge`).

**App Bar / Header:** sticky, contains back button (when nested), screen title, and up to 2 trailing actions max — more than 2 trailing icons should collapse into an Overflow Menu.

**Overflow Menu:** simple bottom-sheet or dropdown list of text actions, used when a screen has more than 2 secondary actions (e.g. Product row's edit/delete/duplicate).

**Do:** keep bottom nav labels to one word, translated.
**Don't:** never exceed 6 bottom nav items — anything beyond that goes under "More."

### 7.13 Tabs
*(existing: `.pos-order-tab` — multi-customer order tabs)*

**Purpose:** switch between parallel, equally-weighted contexts (multiple open orders in POS).

**States:** default, active (filled `color-brand-primary`), add-new (dashed border, `.pos-order-tab-add`), pending-close-confirm (inline red confirm, `.pos-order-tab--confirm` — a good existing pattern: confirm inline rather than a popup).

**Do:** horizontal scroll when tabs overflow (already implemented). Always show an explicit "+" add-tab affordance rather than an implicit gesture.

### 7.14 Badges / Chips
*(existing: `.pill`, `.pill.warn`, `.pill.bad`, `.pill.good`)*

**Purpose:** compact status signaling.

**Variants (per spec request):** Cash, Transfer, Debt (payment-mode chips), Low Stock, Out of Stock (inventory chips), Success, Warning (generic status), Demo Mode (a distinct blue/indigo chip, intentionally off-palette to visually separate "this is a simulation" from real data — matches the existing `#3b5bdb` demo-mode color choice, which should stay separate from the brand palette on purpose).

**Sizes:** one size (~28–30px height) — chips don't need a size scale, they're always inline with text.

**Do:** color = meaning, always (green=good/in-stock, amber=warn/low-stock, red=bad/out-of-stock/debt, blue=informational/demo).
**Don't:** never use chips for primary actions — a chip is not a button.

### 7.15 Progress Bars
*(existing: `.progress`, `.recovery-bar-fill`, `.prod-bar`)*

**Purpose:** show partial completion of a bounded quantity (stock remaining, debt recovery %, sync progress).

**Variants:** thin inline bar (stock level, 4px, `.prod-bar-wrap`), standalone bar with label (sync progress, recovery tracker, 8–12px).

**Color:** fill color communicates status, not just brand — a recovery bar nearing 100% shifts toward `color-success`/lime, a stock bar nearing 0 shifts toward `color-danger`. This is already implicitly true (`.prod-bar` presumably color-codes by level) and should stay explicit in implementation.

### 7.16 Toast / Snackbar
*(existing: `.toast`)*

**Purpose:** brief, non-blocking confirmation of a completed action ("Sale recorded successfully").

**Distinction:** Toast = auto-dismissing, no action (`.toast`, bottom-positioned above nav). Snackbar = same visual family but includes one optional action (e.g. "Undo"). Ulahia doesn't yet have an Undo pattern implemented — when one is added, extend `.toast` with an optional trailing text-button rather than creating a new component.

**Timing:** auto-dismiss at 3s default, longer (5s) if it contains an action button, per standard accessible-timing practice.

**Do:** one toast at a time (queue, don't stack).
**Don't:** never use a toast for errors that require the user to change something — that's an inline error or an alert, not a toast (a toast can be missed/dismissed too easily for anything actionable).

### 7.17 Offline Banner
*(existing: `.offline`)*

**Purpose:** persistent, calm acknowledgment of offline state — not an error.

**Tone:** neutral-informational color (see §3.3 correction — should not share yellow/warning color), reassuring copy ("Working offline — your sales are saved and will sync later"), never alarming iconography (no red triangle).

**Behavior:** appears only when relevant (connection lost), disappears automatically on reconnect with a brief confirming state ("Back online — syncing…") rather than silently vanishing, so the user gets closure on the interruption.

### 7.18 Loading Indicator / Skeletons
*(new — not yet implemented; current app likely shows blank/empty states during load)*

**Loading Indicator:** small spinner, `color-brand-primary`, used for short (<1s expected) waits — button internal loading state, pull-to-refresh.

**Skeleton Cards/Lists/Charts:** gray-tinted placeholder shapes matching the exact geometry of the real content (same radius, same row height) — used for anything expected to take >300ms, e.g. initial product list load, report chart load. Skeletons prevent layout shift and read as "the app is alive," which matters a lot for user trust on slower devices.

**Do:** match skeleton shape to real content shape exactly (same card radius, same line count).
**Don't:** never show a skeleton for less than 300ms (causes a flash) — if data resolves faster, skip the skeleton entirely.

### 7.19 Empty States
*(new — needed for No Products, No Customers, No Reports, No Transactions, Offline, Search Results; existing `.empty` is a start)*

**Anatomy:** friendly illustration (in the brand's illustration style, never a generic stock icon), one-line explanation, one primary action ("Add your first product").

**Tone:** encouraging, never apologetic ("No products yet — let's add your first one" rather than "Sorry, nothing here").

**Do:** always give a next action.
**Don't:** never show an empty state with only text and no way forward.

### 7.20 OTP Entry

**Purpose:** verify identity during signup/recovery.

**Anatomy:** 4–6 individual boxed digit inputs, auto-advance on entry, auto-submit on last digit filled, paste-to-fill support (for SMS-copied codes).

**States:** default, filled, error (all boxes flash danger border briefly + shake micro-interaction, then clear for retry), resend-available (countdown timer, then a text-button "Resend code").

**Accessibility:** each box has `inputmode="numeric"`; screen reader announces "digit 1 of 6" pattern (future web).

### 7.21 PIN Input
*(existing: `PinGate.jsx`)*

**Purpose:** fast local re-authentication (not a security replacement for OTP — a convenience gate).

**Anatomy:** typically 4-digit, masked-dot display (not visible digits), numeric keypad component built into the screen (not relying on OS keyboard) so it works identically across all Android keyboard variants.

**Do:** provide a "Forgot PIN" path that falls back to OTP/recovery.
**Don't:** never lock the user out permanently after failed attempts without an escape hatch.

### 7.22 Barcode Input
*(existing: `BarcodeScanner.jsx`)*

**Purpose:** fast product lookup/entry via camera or hardware scanner.

**States:** camera-active (viewfinder with a scan-line animation), manual-fallback (text field entry when camera unavailable/denied), success (brief green flash/haptic-equivalent confirmation), not-found (offers "Add as new product" inline, connecting to Product Form rather than dead-ending).

**Accessibility:** always provide the manual text-entry fallback — never require camera access to complete a task, since permission may be denied or the device may lack a working camera.

### 7.23 Receipt Components
*(existing: `ReceiptModal.jsx`)*

**Purpose:** the artifact that leaves the app and represents Ulahia to the end customer — held to a higher visual bar than any other component, since it's effectively a piece of the shop owner's own brand.

**Content rules:** business name/shop name prominent at top, itemized list with tabular currency, total large and bold (`font-financial-lg`), payment mode chip, timestamp, "Powered by Ulahia" small mark at the bottom (brand touchpoint, kept subtle — this is the shop's receipt, not an ad for Ulahia).

**Actions:** WhatsApp share (primary, since this is the dominant sharing channel for this user base), Download, Print-ready view — three clearly separated actions, WhatsApp visually first given usage patterns.

**Do:** design the receipt to look correct and complete even as a plain-text/image fallback for feature-phone WhatsApp recipients.

---

## 8. Icons

**Philosophy:** a single, consistent **outline icon family** (matching the Brand Board's Iconography panel — Home, Sell, Products, Customers, Reports, Debts, Restock, Barcode, Transfer, Discount, Notifications, Settings, Security, Backup, Language, Help, Search). Outline over filled by default because outline icons read as calmer and less "alarm-heavy" at small sizes — filled icons are reserved for the single active/selected state.

- **Sizing:** 24px standard (nav, inline-with-text), 20px compact (inline in dense list rows), 32–40px for feature/empty-state icons.
- **Stroke width:** 1.75–2px at 24px size, scaling proportionally — consistent stroke weight across the entire set is non-negotiable; mixing icon sets/weights is the single fastest way to make a UI look unfinished.
- **Active state:** icon switches from outline to filled (or gains `color-brand-primary` fill) + label color changes to match — both signals change together, never color alone (accessibility).
- **Inactive state:** outline stroke in `color-text-muted`.
- Icons never carry meaning alone in a critical flow — always paired with a text label (per §1.4).

---

## 9. Motion

- **Transition durations:** micro-interactions (button press, chip toggle) use `motion-duration-instant` (100ms); standard UI transitions (modal open, screen fade) use `motion-duration-base` (220ms, matches the existing `.view-enter` `fadeSlideIn 0.22s`); celebratory/attention moments (DemoPractice confetti/bounce) use `motion-duration-slow` and the bounce easing, reserved exclusively for genuine milestones (first sale, tour completion) — never for routine actions, or the celebration loses meaning.
- **Easing:** `motion-easing-standard` for anything moving on/off screen; `motion-easing-bounce` only for the celebratory case above.
- **Micro-interactions:** button press scale (0.97–0.985), qty-stepper increment (existing pattern, instant visual increment, no animation needed on the number itself — money/quantity numbers should never animate their value, per the "honest numbers" philosophy in §1.1).
- **Page transitions:** fade + slight upward slide (8px), already implemented via `.view-enter` — keep as the one and only screen-transition pattern; don't introduce slide-from-side or other directional transitions that would need per-screen tuning.
- **Success animations:** reserved for genuine completions (sale recorded, sync complete) — a checkmark scale-in, not a full-screen takeover, except for the specifically-designed Demo/first-sale celebration.
- **Loading animations:** simple rotation spinner or skeleton shimmer only — no novelty loaders.
- **Gesture behaviors:** swipe-to-dismiss on bottom sheets/toasts; horizontal swipe/scroll on tab rows and order-tabs; no complex multi-touch gestures anywhere (target device/user doesn't expect them).

---

## 10. Accessibility

(Expands §1.4 into implementation-level specs.)

- **Dark Mode:** implemented via class-level token overrides (`.app--dark`), already correct architecturally — extend token coverage as new components are added, never hardcode a light-mode color directly in a new component's CSS.
- **High Contrast:** `.app--hc`, same mechanism — every new semantic color must define an HC override before shipping, not as an afterthought.
- **Large Text:** all typography uses `rem`/relative units already (per `font-size: 17px` base + `rem`-based scale) — verify no component uses fixed `px` heights that would clip text if the OS text-size setting is increased; prefer `min-height` over `height` everywhere (already the dominant pattern).
- **Touch Targets:** 48×48px floor, 52–60px for primary actions (§1.4) — enforced already via `min-height` on `.button`/`.field`/`.select`; hold this line for every new component.
- **Contrast:** WCAG AA minimum across the board, AAA target for financial figures and primary CTAs (§1.4). Verify new color pairings against both light and dark token sets before shipping — a pairing that passes in light mode is not guaranteed to pass in dark mode.
- **Keyboard Support (future web):** all interactive elements must be real, focusable elements (`<button>`, `<a>`, `<input>`, `<select>`) — never a `<div onClick>`. This costs nothing extra today and prevents a costly retrofit when the web/desktop version is built.
- **Localization:** see §4.6. Additionally, ensure no icon or layout implies a fixed reading direction bias that would break if a future RTL language were added (not currently in scope, but avoid absolute-positioned "left = back" assumptions baked deeper than necessary).

---

## 11. Content Design

### 11.1 Tone of Voice

Direct, warm, respectful of the user's time and intelligence. Ulahia talks to the shop owner like a competent friend who happens to know bookkeeping — never like a corporate app, never like a cutesy consumer app with excessive exclamation points or emoji stacking. Igbo-language "Ulahia" naming and the "Simple Shop Book" tagline set the register: plain language, no jargon, no anglicized tech buzzwords ("optimize," "leverage," "synergy" are all banned from UI copy).

### 11.2 Microcopy Rules

- Buttons are verbs: "Record Sale," "Add Product," "Send Reminder" — never vague nouns like "Submit" or "OK" alone where a specific verb fits.
- Sentence case everywhere except brand name and proper nouns — no ALL CAPS body copy (uppercase is reserved for the `font-label` kicker style only, per §4.2, and even then it's a small structural label, not a sentence).
- Numbers are always numerals ("5 products," never "five products") — this is a numbers-first product.

### 11.3 Error Messages

Structure: what happened (plainly) + what to do next. Never show a raw technical error or stack trace. Example: "Couldn't save this sale — check your PIN and try again" rather than "Error: validation failed (code 403)."

### 11.4 Success Messages

Short, specific, confirm the exact thing that happened: "Sale recorded — ₦3,450.00" rather than a generic "Success!"

### 11.5 Confirmation Dialogs

State the consequence plainly, name what will be lost if destructive: "Delete Indomie Chicken? This can't be undone" rather than "Are you sure?"

### 11.6 Empty States

Encouraging, action-oriented (§7.19): "No customers yet — add one to start tracking debt" rather than "No data."

### 11.7 Offline Messaging

Reassuring, never alarming (§7.17): "Working offline — everything's saved and will sync when you're back online."

---

## 12. Design Rules

Universal, non-negotiable rules for anyone building a new screen or component:

1. Never use more than two elevation levels inside one section of a screen.
2. Never use more than one primary (solid-fill) CTA button on a screen or modal at a time.
3. Primary buttons always use `color-brand-primary` — never terracotta, lime, or any semantic color as a button's primary fill.
4. Financial values always use tabular numerals and the `₦` symbol, right-aligned when in a list.
5. Cards should not exceed ~4 distinct data points at rest — push additional detail to a tap-through view.
6. Every icon used for a critical action is paired with a text label.
7. Every screen/modal has exactly one clear next action — no dead ends.
8. Color is never the only signal for status — always pair with an icon, label, or shape change (accessibility non-negotiable).
9. All spacing snaps to the 8pt grid (§2.3); 4px only for sub-component micro-gaps.
10. All touch targets meet the 48×48px floor; primary actions target 52–60px.
11. Dark Mode and High Contrast are shipped together with every new component — not as a follow-up pass.
12. No component hardcodes a color, spacing, or radius value that has an equivalent token — always reference the token.
13. Never modal-over-modal; never more than one full-screen takeover at a time.
14. Money/quantity values never animate their numeric value (no count-up effects) — they change instantly, honestly.

---

## 13. Developer Handoff

### 13.1 Component Naming

Keep the existing BEM-ish convention (`.component-part`, `.component-part--modifier`, `.component-part.is-state`) — it's already consistent across the codebase (`.pos-order-tab`, `.pos-order-tab.is-active`, `.pos-order-tab--confirm`) and works well for a plain-CSS architecture without a framework. Do not introduce a second naming convention (e.g. utility-class/Tailwind-style) alongside it — pick one and this is the one already in place.

### 13.2 Token → CSS Variable Naming

Map semantic tokens directly to CSS custom properties with matching names, replacing the current short aliases over time:

```css
:root {
  /* Color */
  --color-brand-primary: #0F6B63;
  --color-brand-secondary: #C24E2A;
  --color-brand-accent: #7BC943;
  --color-text-primary: #17211D;
  --color-text-muted: #61736A;
  --color-border-default: #DBE6DF;
  --color-surface-page: #F6FAF7;
  --color-surface-card: #FFFFFF;
  --color-danger: #E03131;
  --color-warning: #F97316;
  --color-success: #22C55E;
  --color-offline: #687280;

  /* Spacing */
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px;

  /* Radius */
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 24px; --radius-full: 999px;

  /* Elevation */
  --elevation-1: 0 2px 8px rgba(23,33,29,0.04);
  --elevation-2: 0 16px 38px rgba(23,33,29,0.10);
  --elevation-3: 0 18px 38px rgba(23,33,29,0.22);

  /* Motion */
  --motion-fast: 150ms; --motion-base: 220ms; --motion-slow: 400ms;
  --motion-standard: cubic-bezier(0.2, 0, 0, 1);
}
```

Legacy variables (`--ink`, `--muted`, `--line`, `--bg`, `--panel`, `--green`, `--green-2`, `--yellow`, `--red`, `--blue`, `--shadow`) can alias to the new tokens during migration (`--ink: var(--color-text-primary)`) so existing component CSS keeps working unchanged while new components adopt the new names directly. Retire the legacy names only once nothing references them.

### 13.3 Figma Organization (recommended structure)

```
Ulahia Design System
├── 00 Foundations
│   ├── Color (light/dark/HC swatches, semantic mapping table)
│   ├── Typography (type scale, live text styles)
│   ├── Spacing & Grid
│   ├── Elevation
│   └── Icons (full outline set, sized frames)
├── 01 Components
│   ├── Buttons / Inputs / Cards / Chips / Navigation / Modals / ...
│   (one page per component family, each with variants + states as Figma variants)
├── 02 Patterns
│   ├── Empty states, Loading/Skeletons, Error handling
├── 03 Screens (Phase 3 — not started yet)
└── 04 Prototype (Phase 4 — not started yet)
```

Use Figma variables bound 1:1 to the token names in §13.2 so a color/spacing change propagates without manual reassignment, and so an eventual design-token export (Figma → JSON → CSS) is mechanical.

### 13.4 Implementation Recommendations

- Keep the plain-CSS approach — no framework migration is warranted by this spec. The existing custom-properties + BEM-ish class pattern already supports everything above (dark mode, HC mode, semantic tokens) once the token layer is filled in.
- Land token expansion (§2) as its own PR before any component visual changes, so the diff is reviewable as "new tokens added, nothing visually changes yet" — then follow with targeted PRs per component family (buttons, cards, typography) that re-point existing classes at the new tokens.
- Treat the color reconciliation (§3.1, teal shift) and currency symbol change (§4.5) as separate, explicitly-flagged decisions requiring sign-off — both are visible, brand-level changes, not routine token cleanup.

---

*End of v1.0. This document is the foundation for Phase 3 (UX Architecture / screen design) and must be updated in place — not forked — as components are added or refined.*
