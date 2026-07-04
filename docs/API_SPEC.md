# API_SPEC.md

> Project: Ulahia
>
> Purpose: Defines API standards, communication rules, authentication requirements, request/response formats, and versioning.
>
> Status: Living Document

---

# Overview

This document defines how the frontend, backend, third-party services, and future mobile applications communicate with Ulahia.

The API must remain:

- Consistent
- Secure
- Predictable
- Versioned
- Well documented

---

# API Principles

- Every endpoint has one responsibility.
- Every request must be validated.
- Every response must be predictable.
- APIs should never expose internal database structures.
- Authentication is required unless explicitly marked as public.

---

# Authentication

Authentication is handled by Supabase Authentication.

Protected endpoints require:

- Valid session
- Authenticated user
- Authorized business access
- Authorized store access (where applicable)

---

# API Versioning

Current Version:

v1

Future versions:

- v2
- v3

Breaking changes should create a new version instead of modifying existing endpoints.

---

# Request Standards

Every request should include:

- Authentication Token
- Content-Type
- Accept Header

JSON should be the default request format.

---

# Response Standards

Successful responses should include:

- success
- data
- message

Example:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully."
}
```

---

# Error Responses

Error responses should include:

- success
- error
- code
- message

Example:

```json
{
  "success": false,
  "error": "Validation Error",
  "code": 400,
  "message": "Product name is required."
}
```

---

# HTTP Status Codes

Common status codes:

- 200 OK
- 201 Created
- 204 No Content
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 422 Validation Error
- 429 Too Many Requests
- 500 Internal Server Error

---

# Resource Structure

Primary API resources include:

- Authentication
- Users
- Businesses
- Stores
- Products
- Categories
- Inventory
- Customers
- Sales
- Payments
- Expenses
- Reports
- Notifications
- Settings
- AI
- Marketplace

---

# Pagination

Large datasets should support:

- Page
- Limit
- Sorting
- Filtering
- Searching

---

# Filtering

Endpoints should support filtering where applicable.

Examples:

- Date
- Status
- Category
- Store
- Customer
- Product

---

# Sorting

Supported sorting:

- Ascending
- Descending
- Created Date
- Updated Date
- Name
- Price

---

# Searching

Search should support:

- Product Name
- Barcode
- Customer Name
- Receipt Number
- Phone Number

---

# Validation

All incoming requests must be validated before processing.

Validation includes:

- Required fields
- Data types
- Business ownership
- Store ownership
- Input sanitization

---

# Rate Limiting

Sensitive endpoints should support rate limiting.

Examples:

- Login
- Password Reset
- OTP Verification
- AI Requests

---

# Security

Every endpoint should:

- Validate authentication
- Validate authorization
- Prevent SQL injection
- Prevent XSS
- Prevent CSRF where applicable
- Log critical operations

---

# Logging

API logs should include:

- Timestamp
- User ID
- Business ID
- Endpoint
- Status Code
- Execution Time

Sensitive information must never be logged.

---

# Performance

API goals:

- Low latency
- Efficient database queries
- Minimal payload size
- Response caching where appropriate

---

# Future APIs

Future API integrations may include:

- Payment gateways
- SMS providers
- WhatsApp
- Email providers
- Accounting software
- Marketplace partners
- Public Developer API

---

# Related Documents

- PRODUCT_SPECIFICATION.md
- ARCHITECTURE.md
- DATABASE.md
- BUSINESS_RULES.md