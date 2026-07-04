# ENGINEERING_RULES.md

> Project: Ulahia
>
> Purpose: Defines mandatory engineering standards for all human developers and AI coding assistants.
>
> Status: Living Document

---

# Purpose

These rules are mandatory.

Every contribution to Ulahia must follow them.

These rules apply to:

- GitHub Copilot
- Claude Code
- ChatGPT
- Human developers
- Future contributors

---

# Core Principles

Every change must prioritize:

- Simplicity
- Readability
- Maintainability
- Security
- Performance
- Scalability

---

# Development Rules

- Never duplicate existing functionality.
- Search the codebase before creating new code.
- Prefer extending existing components over creating new ones.
- Build reusable solutions.
- Keep files focused on one responsibility.
- Follow the established project structure.

---

# Code Quality

Every change must:

- Compile successfully.
- Pass linting.
- Pass type checking.
- Avoid unnecessary complexity.
- Remove unused code.
- Use meaningful names.

---

# Architecture Rules

- Respect the architecture defined in `ARCHITECTURE.md`.
- Separate UI from business logic.
- Keep components modular.
- Avoid tightly coupled code.
- Shared logic belongs in shared modules.

---

# Database Rules

- Never bypass Row Level Security (RLS).
- Never expose sensitive data.
- Validate all database operations.
- Use migrations for schema changes.
- Preserve data integrity.

---

# Security Rules

- Never commit secrets.
- Never expose API keys.
- Validate all user input.
- Sanitize external data.
- Enforce authentication where required.
- Enforce authorization for protected resources.

---

# UI Rules

- Follow `DESIGN_SYSTEM.md`.
- Maintain responsive layouts.
- Support accessibility.
- Reuse UI components whenever possible.
- Keep interactions consistent.

---

# API Rules

- Follow `API_SPEC.md`.
- Validate every request.
- Return predictable responses.
- Handle errors gracefully.
- Never leak internal implementation details.

---

# Documentation Rules

A feature is **not complete** until:

- Documentation is updated.
- Related documents are reviewed.
- Feature status is updated if necessary.

---

# Git Rules

Use clear commit messages.

Example:

- feat: add customer debt tracking
- fix: resolve inventory calculation bug
- refactor: simplify checkout workflow
- docs: update product specification

---

# AI Assistant Rules

AI assistants must:

- Read project documentation before making changes.
- Preserve existing architecture.
- Avoid unnecessary refactoring.
- Ask for clarification when requirements are ambiguous.
- Explain significant architectural decisions.

---

# Pull Request Checklist

Before merging:

- Code builds successfully.
- No linting errors.
- No type errors.
- Documentation updated.
- No duplicated logic.
- No security regressions.
- No unnecessary dependencies.

---

# Definition of Done

A task is complete only when:

- Functionality works correctly.
- Code quality standards are met.
- Documentation is updated.
- No regressions are introduced.
- The implementation follows this document.

---

# Related Documents

- PRODUCT_SPECIFICATION.md
- ARCHITECTURE.md
- DATABASE.md
- API_SPEC.md
- DESIGN_SYSTEM.md
- BUSINESS_RULES.md