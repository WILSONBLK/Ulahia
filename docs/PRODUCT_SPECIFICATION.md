# PRODUCT_SPECIFICATION.md

> **Project:** Ulahia
>
> **Version:** 1.0
>
> **Status:** Implementation-Aligned
>
> **Owner:** Wilson
>
> **Document Purpose:** Describes the product behavior currently implemented in the codebase. This document excludes inferred, assumed, planned, or future functionality.

---

# 1. Product Summary

## What Ulahia Currently Is

Ulahia is a shop-management web application for small retail operations. The current implementation combines local account access, onboarding, point-of-sale, product/inventory management, customer debt tracking, reporting, notifications, settings, and navigation utilities in one application.

The active application is built around a single in-app view system rather than route-based page navigation. Core business state is stored locally per profile, with optional cloud backup/sync behavior when Supabase is enabled.

The implemented product supports:

- Owner signup and login
- Password-based device access with recovery-code fallback
- Setup onboarding and guided in-app onboarding
- POS checkout for cash, transfer, and debt sales
- Fixed-stock and flexible-value inventory models
- Customer debt ledger and repayment recording
- Period-based reports and receipt sharing
- Derived notifications for stock, debt, and offline state
- Settings for shop details, language, appearance, backup, and inventory PIN security
- Dashboard/home navigation, multi-store switching, and demo mode entry

---

## Product Positioning

The current implementation is optimized for:

- Small shop owners
- First-time operators who need guided setup
- Daily transaction recording
- Basic stock monitoring
- Customer debt follow-up
- Local-first usage with offline awareness

The current implementation does not present itself in code as a team-management platform, enterprise system, or AI assistant.

---

# 2. Implemented Product Structure

## Module Classification

### Domain Modules

- POS / Sell
- Inventory / Products
- Customers / Debts

### Control Layer

- Settings

### Derived Systems

- Reports
- Notifications

### Navigation Layer

- Dashboard shell (Home)
- More / utility hub

### Supporting Flows

- Authentication and access
- Setup onboarding and guided onboarding

---

# 3. Access And Onboarding

## Authentication And Access

The implemented access model includes:

- Welcome screen with Get Started, Explore Demo, and Log In entry points
- Signup flow with full name, phone number, shop name, password, confirm password, and terms/privacy agreement
- Login flow using phone number plus password
- Recovery-code login path that imports cloud-backed state when Supabase is enabled and matching data is found
- Session unlock screen shown on app open when a password hash exists for the main profile
- Unlock fallback using locally stored recovery code

Current login and unlock behavior is device-oriented:

- Passwords are stored as hashed local credentials
- A browser-session unlock flag is used after successful authentication
- Recovery-code login/import is an alternative to password login, not a separate user-management system

## Onboarding

The implemented onboarding experience has three parts:

- Setup onboarding after signup
- Guided in-app tour
- Demo-only practice sale walkthrough

The setup onboarding sequence is:

1. Language selection
2. Permissions screen
3. Shop setup
4. Recovery-code confirmation
5. All-set handoff into the app

The guided tour is shown when onboarding is not complete and the local tour-seen marker is absent. It uses spotlight, card, and tap-overlay steps. Help can replay the tour by clearing stored onboarding markers and restarting onboarding state.

---

# 4. Navigation Layer

## Dashboard Shell

The active dashboard is implemented by the Home screen.

It currently provides:

- More entry point
- Notifications entry point with badge count
- Greeting and store context
- Store switcher and add-store modal
- Sell Now primary action
- Open-sales resume list
- Today summary cards for sales, profit, orders, and customers
- Close-of-day modal summarizing today sales, profit, transaction count, cash, transfer, and debt given

Dashboard cards currently navigate as follows:

- Sales, profit, and orders cards open Reports
- Customers card opens Customers

## More / Utility Hub

The More screen is a grouped shortcut hub.

It currently provides row-based access to:

- Reports
- Debts
- Expenses
- Settings
- Help
- Logout
- Try Demo Mode

The More screen also shows a profile header and a dynamic debt subtitle on the Debts row when outstanding debt exists.

---

# 5. Domain Modules

## POS / Sell

The POS module is implemented across Sell, Review Sale, Checkout, and Receipt modal surfaces.

Implemented POS behavior includes:

- Multi-order cart workflow with hold/resume behavior
- Fixed products sold by quantity
- Flexible products sold by entered amount
- Product search and category filtering
- Product pin/unpin behavior
- Customer attachment to the active order
- Review stage for quantity edits and discounting
- Checkout modes for cash, transfer, and debt
- Partial and full debt settlement updates the customer balance ledger
- Automatic transaction completion and receipt display
- Receipt sharing, WhatsApp sharing, and image download

Implemented transaction effects include:

- Fixed-stock decrement on completion
- Customer debt creation/update when a debt balance remains
- Order closure and next-order activation/creation

## Inventory / Products

The inventory module is implemented primarily through the Products view and related restock/scanner flows.

Implemented inventory behavior includes:

- Product create, edit, delete, and restore
- Two product models:
	- Fixed products with cost, price, quantity, and low-stock threshold
	- Flexible products with invested value and recovery tracking
- Single-product restock
- Bulk restock
- Barcode scan, manual barcode entry fallback, and barcode-to-product linking
- Fixed-product stock bars and low/out-of-stock states
- Flexible-product recovery indicators
- PIN/OTP gate protection for inventory-changing actions

Inventory is also affected indirectly by POS transaction completion for fixed products.

## Customers / Debts

Customers and Debts are implemented as a single ledger-style module.

Implemented behavior includes:

- Shared Customers/Debts screen
- Owing and Cleared tabs
- Search by customer name or phone
- Outstanding debt totals
- Per-customer balance display
- Payment recording modal with optional note
- Full-payment shortcut
- WhatsApp reminder shortcut when phone exists
- Automatic customer debt creation/update from debt sales

There is no separate customer profile page in the active implementation.

---

# 6. Derived Systems

## Reports

Reports is a derived analytics/history view over transactions and customer balances.

Reports is fully computed at runtime from existing transaction and customer state. It does not store a separate dataset.

Implemented Reports behavior includes:

- Period tabs for today, week, month, and all time
- Sales total, profit total, cash total, transfer total, and debt total summaries
- Flexible-product recovery cards using all-time sold-versus-invested values
- Period-filtered transaction history
- Receipt modal drill-down from transaction rows
- Receipt share, WhatsApp share, and PNG save actions

The current Reports implementation is based on existing transaction and customer state. It does not implement custom date ranges or file-based report exports.

## Notifications

Notifications is a runtime-derived UI projection of inventory, customer, and connectivity state. It is computed at runtime and not persisted.

Implemented notification generation sources are:

- Fixed-product out-of-stock state
- Fixed-product low-stock state
- Customer outstanding debt state
- Browser online/offline status

Implemented Notifications behavior includes:

- Home bell badge driven by derived item count
- Notifications list screen
- Empty state when no items exist
- Navigation cards for stock and debt alerts
- Static offline card without target navigation

No stored notification history, read/unread model, or mark-as-read control is implemented.

---

# 7. Control Layer

## Settings

Settings is the current control surface for shop-level and device-level configuration.

Implemented sections include:

- Shop Details
- Appearance
- Backup / Export
- Cloud Backup (conditional)
- Profile switching (main, demo, and store profiles)
- Security

Implemented Settings behavior includes:

- Editing and saving shop name, owner name, phone, business type, and currency
- Language switching
- Dark mode toggle
- High-contrast toggle
- JSON export of current state
- JSON restore with product-array validation
- Recovery-code display when Supabase is enabled
- Switching between main and demo profiles
- Inventory PIN set/change/remove flows
- Inventory OTP generation/regeneration with countdown

Notification preference controls are not implemented in Settings.

---

# 8. Shared Product Behaviors

## Profile And Store Model

The current application distinguishes between:

- Main profile
- Demo profile
- Additional store profiles created from the dashboard

Implemented multi-store behavior includes:

- Saving state per profile in local storage
- Switching between store profiles
- Creating new stores with inherited owner/contact and device preferences

## Persistence And Cloud Behavior

The current implementation is local-first.

Implemented persistence behavior includes:

- Local state persistence per profile
- JSON export/import backup
- Cloud recovery code generation/storage
- Recovery-code-based state pull/import during login when cloud data is found

Conditional cloud backup and recovery-code based state restore when Supabase is enabled. Backup and restore are triggered flows, not continuous synchronization.

## Permissions And Capability Use

Implemented permission/capability handling includes:

- Onboarding permission requests/checks for storage, camera, notifications, and sync preference
- Camera access for barcode scanning when live scanner is used
- File/image selection for product images
- Web Share API usage for receipts when supported
- Browser online/offline events for notification derivation

Camera and file access are feature-based. Browser notification permission is not actively enforced by the Notifications module logic.

Permissions are not broadly requested across all modules; they are feature-specific.

---

# 9. Current Product Boundaries

## Not Described As Implemented

The following items are not documented here as product features because they are not verified as implemented in the current code behavior reviewed for this spec update:

- AI assistant features
- Team or employee management
- Payroll
- Supplier management
- Marketplace features
- Plugin ecosystem
- Public API platform
- Third-party integration platform
- Advanced analytics beyond the current Reports screen
- Mobile-native applications

## Scope Note

This document reflects the implemented behavior verified in the current codebase and reverse-engineering outputs used for this update. It is intentionally narrower than a roadmap or vision document.