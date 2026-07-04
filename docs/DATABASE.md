# DATABASE.md

> Project: Ulahia
>
> Purpose: Defines the database architecture, data model, relationships, and database standards.
>
> Status: Living Document

---

# Overview

Ulahia uses PostgreSQL through Supabase as its primary database.

The database is designed to support:

- Multi-tenant architecture
- High performance
- Data integrity
- Scalability
- Security through Row Level Security (RLS)

---

# Database Principles

- Every business owns its own data.
- Data isolation is mandatory.
- Every table should have a primary key.
- Foreign keys should enforce relationships.
- Soft deletes are preferred over permanent deletion where appropriate.
- Auditability is required for critical records.

---

# Core Entities

The system consists of the following primary entities:

## Business

Represents an organization using Ulahia.

---

## Store

Represents a physical or virtual business location.

Each store belongs to one business.

---

## User

Represents an authenticated person using the platform.

---

## Staff

Represents employees working within a business.

---

## Product

Represents an item or service available for sale.

---

## Category

Groups products together.

---

## Inventory

Tracks stock quantities for products.

---

## Customer

Stores customer information and purchase history.

---

## Sale

Represents a completed transaction.

---

## Sale Item

Stores products sold within a sale.

---

## Payment

Stores payment records linked to sales.

---

## Expense

Stores business expenses.

---

## Supplier

Represents suppliers providing products.

---

## Notification

Stores system-generated notifications.

---

## Settings

Stores business and user configuration.

---

# Entity Relationships

Business

↓

Stores

↓

Products

↓

Inventory

↓

Sales

↓

Payments

↓

Reports

Customers connect to Sales.

Products connect to Categories.

Inventory connects to Products.

Staff connect to Businesses.

Notifications connect to Users.

---

# Data Integrity Rules

- Foreign keys must be enforced.
- Cascading deletes should be used carefully.
- Critical financial records should never be permanently deleted.
- Inventory history should remain immutable.
- Receipt numbers must be unique.

---

# Naming Conventions

Tables

- Singular or plural (choose one standard and remain consistent)
- snake_case

Columns

- snake_case

Primary Keys

- id

Foreign Keys

- entity_id

Examples

- product_id
- customer_id
- sale_id

---

# Common Columns

Most tables should contain:

- id
- created_at
- updated_at
- created_by
- business_id
- store_id

Where applicable:

- deleted_at
- status

---

# Indexing Strategy

Indexes should be created for:

- Foreign keys
- Frequently searched fields
- Receipt numbers
- Phone numbers
- Product names
- Barcodes
- Email addresses

---

# Security

All tables should implement:

- Row Level Security (RLS)
- Business isolation
- Store isolation where required
- Authenticated access only

---

# Audit Strategy

Critical operations should be logged:

- Login
- Product creation
- Product update
- Product deletion
- Sales
- Refunds
- Inventory adjustments
- Settings changes

---

# Backup Strategy

The database should support:

- Automated backups
- Point-in-time recovery
- Restore procedures
- Disaster recovery

---

# Performance Goals

- Fast queries
- Proper indexing
- Optimized joins
- Minimal redundancy
- Efficient pagination

---

# Future Expansion

The schema should support future modules including:

- Marketplace
- Accounting
- Payroll
- AI
- Public API
- Plugin ecosystem