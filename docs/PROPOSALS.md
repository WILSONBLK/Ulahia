# PROPOSALS.md

> Documentation-only proposal notes captured during the system audit.
>
> This file lists architectural observations and bounded recommendations only.

---

## 1. Stateless Notifications

**Observation**

Notifications are currently derived at render time from products, customers, and online state. They are not stored as records, and opening the Notifications screen does not change notification state.

**Recommendation**

If notification workflows later require durability, introducing a persisted notification record model may become necessary.

---

## 2. No Persistent Notification History

**Observation**

The current notification system has no historical log, read/unread tracking, dismissal state, or retention model.

**Recommendation**

If the distinction between ephemeral alerts and historical operational records becomes important, additional persistence requirements may need to be defined.

---

## 3. Reports Are Snapshot-Oriented

**Observation**

Reports are computed directly from current transaction and customer state using period filters at read time. The current system does not store separate reporting aggregates or time-series analytics records.

**Recommendation**

If reporting needs expand beyond current transaction-based recomputation, additional aggregate or time-series storage requirements may need to be considered.

---

## 4. State Evolution and Reducer Centralization

**Observation**

The current application state captures business entities and transactions, but it does not maintain a general append-only audit trail for operational changes such as edits, deletions, restocks, or settings changes.

State transitions are reducer-driven and overwrite current state directly. The system does not preserve a normalized event stream that can be replayed independently of current snapshots.

Core business behavior is concentrated in one store reducer that handles authentication, onboarding, cart flow, transactions, inventory, customers, settings, expenses, and profile loading.

This centralization increases the amount of product behavior that depends on one shared state transition surface.

**Recommendation**

If traceability, replayability, or further growth in state-transition complexity become important, additional state-evolution structure may be required in future.

---

## 5. Tight Coupling Between UI And Global State

**Observation**

Many screens read from and dispatch directly into the global store, with view routing, derived summaries, and business transitions closely tied to component-level handlers.

**Recommendation**

If product surface complexity increases, clearer boundaries between presentation logic, derived selectors, and state-transition logic may become increasingly important.

---

## 6. Cross-Module Dependency Complexity

**Observation**

Several modules affect each other indirectly through shared store state. Current concrete dependency paths include POS -> Inventory + Customers, Notifications -> Inventory + Customers + Online State, Reports -> Transactions + Customers, and Dashboard -> Notifications + POS + Reports.

**Recommendation**

If these dependency paths continue to expand, clearer documentation of shared-state ownership and downstream effects may become increasingly important. Risk: tightly connected modules can make behavior changes harder to isolate.

---

## 7. View Routing By Shared String State

**Observation**

Primary screen navigation is driven by a shared `view` field and `SET_VIEW` dispatches across modules. This keeps navigation simple, but also makes cross-screen transitions tightly coupled to string values shared throughout the UI.

**Recommendation**

If navigation complexity increases, maintaining a clearer documented source of truth for valid view states and transition ownership may become more important.

---

## 8. Mixed Persistence Responsibilities

**Observation**

The product combines local profile persistence, optional cloud sync, JSON export/import, demo mode state, and recovery-code flows. These persistence paths are functional, but responsibilities are spread across store, auth, sync helpers, and settings flows.

**Recommendation**

If persistence paths continue to grow, clearer documentation of local storage, cloud backup, recovery import, and manual backup responsibilities may become necessary. Risk: mixed persistence responsibilities can make operational expectations harder to interpret.

---

## 9. Legacy And Active Surface Overlap

**Observation**

The audit found active surfaces and components that are not part of the current primary routing flow coexisting in the codebase, including alternate dashboard and inventory-related surfaces.

**Recommendation**

If the distinction between active and inactive surfaces becomes more operationally important, clearer documentation of current runtime behavior versus file presence may be needed.

---

## 10. Derived Logic Spread Across Hooks And Screens

**Observation**

Important business-facing summaries are distributed across reducer logic, hooks, and screen-level calculations, including stats, notification derivation, report calculations, and dashboard summaries.

**Recommendation**

If more derived logic continues to accumulate across screens and hooks, clearer documentation of logic ownership may become increasingly important. Risk: dispersed derivation rules can make future behavioral analysis harder.