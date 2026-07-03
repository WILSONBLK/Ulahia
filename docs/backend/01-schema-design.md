# Backend schema — Phase A (relational foundation)

**Status:** Applied to the live Supabase project (`ibrlcphmocbydzdfhklo`) on 2026-07-02. **Not wired into the app.** `src/sync.js`, `src/store.jsx`, and every component are untouched by this change — the app's current offline-first behavior, PIN gate, and recovery-code UX work exactly as they did before this migration.

## Why this exists

The app's cloud backup (`src/sync.js`) has always targeted a single table, `shop_data` (one JSONB blob per shop, keyed by `profile_id`/`recovery_code`) — but that table was never actually created, so cloud sync has never worked. Rather than just creating that one blob table, this migration lays down a **proper relational schema** that mirrors the app's real local state shape (read directly from `src/store.jsx`), so the backend can grow into a fuller product later without a rewrite — while today's app keeps working completely unchanged.

## What was built

Migration: [`supabase/migrations/20260702100000_shops_and_pos_schema.sql`](../../supabase/migrations/20260702100000_shops_and_pos_schema.sql). Eight tables, all scoped (directly or transitively) to `shops.id`:

| Table | Mirrors | Notes |
|---|---|---|
| `shops` | `state.shop` | Parent table; also the new home for `recovery_code` |
| `products` | `state.products[]` | One table, `type` discriminator (`fixed`/`flexible`) + a `CHECK` constraint enforcing which columns apply per type |
| `sales` + `sale_items` | `state.transactions[]` + `.items[]` | Price/cost snapshotted on the line item, same as the app already does |
| `customers` | `state.customers[]` | `total_balance` and the `transactions: [id,...]` array are dropped — both are derivable from real FKs now |
| `payments` | `customers[].payments[]` | Promoted from an inline array to a real table |
| `expenses` | `state.expenses[]` | Kept separate from `withdrawals` — different semantics (categorized cost vs. cash-out), no shared query benefit from merging |
| `withdrawals` | `state.withdrawals[]` | See above |

`orders` (open carts/tabs) is **not** represented — it's ephemeral and was already excluded from the app's own sync payload.

## Key design choices

- **All primary keys are client-supplied UUIDs** (no `default gen_random_uuid()`) — matches the app's existing offline-first pattern of generating IDs at creation time, before any server round-trip. A future integration can pass the app's own IDs straight through.
- **RLS is enabled on every table**, each with one permissive placeholder policy (`USING (true) WITH CHECK (true)` for `anon`). This is **operationally identical to today's trust model** — anyone with a `shop_id` UUID can read/write that shop's data, same as the recovery-code system today. It is *not* a real security boundary. It's structured this way specifically so that introducing real `auth.uid()`-based policies later is a clean policy swap, not a disruptive first-time RLS rollout on a table that was previously wide open by default.
- **`expenses`/`withdrawals` stay separate**, `products` stays as one table with a type discriminator — reasoning for each is in the migration file's comments and was validated against the actual query patterns the app already has.

## What this is *not*, yet

- Not wired into `sync.js` — the app still can't actually push/pull data anywhere. That's a deliberate, separate future step ("Phase B").
- Not real security — no Supabase Auth exists in the app; these tables have the same exposure as a leaked `shop_id` would have against the never-built `shop_data` blob.
- Not a multi-tenant/staff/multi-branch backend — this is intentionally sized for "one shop = one `shop_id`," matching the app today.

## Phase B (future, not started)

Wiring `src/sync.js` to write/read these tables instead of (or in addition to) a blob would be the next step, if/when wanted — replacing `pushState`/`pullByCode`'s single-row upsert with per-entity reads/writes, while keeping the exact same user-visible recovery-code UX. That's a live-code change to a deployed app and deserves its own careful, separately-reviewed pass — not bundled into this schema-only phase.
