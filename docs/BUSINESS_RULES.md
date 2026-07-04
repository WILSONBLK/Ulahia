# BUSINESS_RULES.md

> Project: Ulahia
>
> Purpose: Defines all business logic and operational rules.
>
> Status: Living Document

---

# General Rules

- Every record belongs to a business.
- Every business is isolated from other businesses.
- Users must never access another business's data.
- Every important action should be logged.
- Critical operations should be recoverable where possible.

---

# Authentication

- A user must authenticate before accessing business data.
- Sessions expire after inactivity.
- Recovery codes must be unique.
- Passwords must never be stored in plain text.

---

# Store Rules

- A user may own multiple stores.
- Each store has its own inventory.
- Each store has its own customers.
- Each store has its own reports.
- Switching stores must immediately change the active data context.

---

# Product Rules

- Every product belongs to one store.
- Products may be active or inactive.
- Selling price cannot be less than zero.
- Stock cannot fall below zero unless negative inventory is explicitly enabled.
- Products can have images.
- Products may have barcodes.
- Flexible products do not permanently affect inventory unless configured.

---

# Inventory Rules

- Every stock movement must be recorded.
- Restocking increases inventory.
- Sales decrease inventory.
- Manual adjustments require a reason.
- Inventory history must never be deleted.

---

# Sales Rules

- Every completed sale receives a unique receipt number.
- A completed sale cannot be edited.
- Refunds create separate records.
- Discounts cannot reduce totals below zero.
- Taxes must be calculated before payment confirmation.

---

# Customer Rules

- Customers can make multiple purchases.
- Customers can have outstanding debt.
- Debt payments reduce outstanding balances.
- Customer history is permanent.

---

# Payment Rules

- Payments must always reference a sale.
- Partial payments are supported.
- Full payment closes the balance.
- Failed payments must never modify inventory.

---

# Reports

- Reports are generated from transactional data.
- Reports must be read-only.
- Historical reports must not change after generation unless source transactions change.

---

# Notifications

- Low stock alerts trigger when stock reaches the configured threshold.
- Out-of-stock alerts trigger when quantity reaches zero.
- Notifications respect user preferences.

---

# AI Rules

- AI can recommend actions.
- AI must never perform destructive actions automatically.
- Users must approve AI-generated actions before execution.

---

# Offline Rules

- Sales can continue offline.
- Offline transactions queue for synchronization.
- Sync conflicts require resolution rules.
- No data should be silently discarded.

---

# Audit Rules

The following actions must be logged:

- Login
- Logout
- Product creation
- Product updates
- Product deletion
- Inventory adjustments
- Sales
- Refunds
- Customer payments
- Settings changes