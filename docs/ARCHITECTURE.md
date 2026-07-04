# ARCHITECTURE.md

> Project: Ulahia
>
> Purpose: Defines the technical architecture of the application.
>
> Status: Living Document

---

# Overview

Ulahia is built using a modern full-stack architecture focused on scalability, maintainability, performance, and security.

The application follows a client-server architecture with Supabase providing backend services.

---

# Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Shadcn/UI
- Framer Motion

---

## Backend

- Supabase
- PostgreSQL
- Edge Functions
- Row Level Security (RLS)
- Realtime
- Storage

---

## Infrastructure

- Vercel
- GitHub
- GitHub Copilot
- Claude Code

---

# High-Level Architecture

```
Client (Web)

↓

Authentication

↓

Application Layer

↓

API Layer

↓

Supabase

├── PostgreSQL
├── Authentication
├── Storage
├── Realtime
└── Edge Functions

↓

External Integrations
```

---

# Frontend Architecture

The frontend is responsible for:

- Rendering UI
- Navigation
- Form validation
- State management
- API communication
- User interactions
- Offline support

Business logic should remain separate from presentation components whenever possible.

---

# Backend Architecture

Supabase is responsible for:

- Authentication
- Database
- Authorization
- Storage
- Realtime synchronization
- Edge Functions
- Security policies

---

# Data Flow

```
User Action

↓

Frontend Validation

↓

API Request

↓

Authentication Check

↓

Authorization Check

↓

Database Operation

↓

Response

↓

UI Update
```

---

# Authentication Flow

```
User Login

↓

Authentication

↓

Session Creation

↓

Role Verification

↓

Store Context

↓

Dashboard
```

---

# Application Modules

The application consists of:

- Authentication
- Onboarding
- Dashboard
- POS
- Products
- Inventory
- Customers
- Reports
- Expenses
- Notifications
- Settings
- AI
- Marketplace
- Administration

Each module should remain independent where possible.

---

# Security Architecture

Security principles include:

- Row Level Security
- Authentication Required
- Role-Based Access
- Secure Storage
- Encrypted Communication
- Audit Logging

---

# Performance Goals

The system should prioritize:

- Fast page loads
- Efficient database queries
- Lazy loading
- Code splitting
- Optimized assets
- Responsive UI

---

# Scalability

The architecture must support:

- Multiple businesses
- Multiple stores
- Large product catalogs
- Large transaction volumes
- Multiple staff members
- Future enterprise customers

---

# Offline Support

The architecture should support:

- Offline sales
- Offline inventory operations
- Local caching
- Automatic synchronization
- Conflict resolution

---

# AI Architecture

AI services should operate as supporting systems.

Responsibilities include:

- Recommendations
- Analytics
- Search
- Forecasting
- Business insights

AI must not perform destructive actions without user confirmation.

---

# Design Principles

The architecture follows these principles:

- Separation of concerns
- Reusable components
- Modular design
- Scalability
- Security by default
- Maintainability
- Performance first

---

# Related Documents

- PRODUCT_SPECIFICATION.md
- FEATURE_MAP.md
- BUSINESS_RULES.md
- DATABASE.md
- API_SPEC.md