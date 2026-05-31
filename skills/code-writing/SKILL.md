---
name: code-writing
description: Write, refactor, and review TypeScript and TSX in a direct, low-indirection style. Use when the user wants code that reads top-down, keeps contracts explicit, names things by domain meaning and role, keeps the main path easy to scan, and avoids abstraction that does not clearly improve readability or correctness.
---

# Code Writing

## Overview

Apply a narrow style guide for TypeScript and TSX that favours direct structure, explicit contracts, and low indirection. Keep the code easy to scan, keep the main path near the top, and avoid abstraction that makes the file harder to read.

Read [references/rules.md](references/rules.md) before editing. Use it as the working checklist.

## Workflow

1. State assumptions before editing. If the task is ambiguous, stop and ask.
2. Define proof of success and the check that will verify it.
3. Inspect the file and nearby files first. Preserve established patterns unless the user is explicitly changing them.
4. Make the smallest change that satisfies the request. Do not add speculative flexibility, unrelated refactors, or adjacent cleanup.
5. Tighten the contract at the source boundary. Parse external data early, normalise once, and throw clear errors instead of silently skipping.
6. Structure the file for scanning. Prefer:

```text
imports
types
consts
main function
helper functions below
```

7. Choose the simplest structure that matches the problem. Add a helper, wrapper type, or extra layer only when it clearly improves readability or correctness.
8. Name things by domain meaning and role. Keep transport or API-specific names at the boundary.
9. Remove only unused imports, variables, or functions created by your change.
10. Keep comments and JSDoc rare. Make them concise, simple, and helpful. Use them to explain why, constraints, or tradeoffs.
11. For Git history, prefer adding a new commit over amending an existing commit. Never force-push.
12. Verify after edits using the repo’s required checks and report the proof.

## File Shape

Arrange files like this unless the local file already has a better established pattern:

```text
imports
types
consts
main function
helper functions below
```

For TSX files, use:

```text
imports
types
consts
exported component
small render helpers
static config last
```

## Default Decisions

Prefer these defaults:

```text
fail fast > silent skipping
explicit parsing > type assertion
low indirection > wrapper types and helper stacks
one source of truth > duplicated booleans
simple expressions > dense cleverness
names by meaning > names by implementation detail
local inline logic > one-off helper extraction
code as source of truth > behavioural docs
undefined only when absence is real, null only when the domain needs a distinct null
rows.find(...) for small datasets when it reads better than parallel indexes
Map/Set only when the lookup model is clearly part of the design
```

## Review Focus

When reviewing or refactoring, actively look for:

```text
duplicated state
loose optionals and nulls
silent continue paths
generic helpers that hide simple logic
helper stacks that hurt scanning
fancy expressions that hurt scanning
types that only exist to mirror a single local expression
raw casts where parsing should happen
naming that hides meaning, role, or ownership
comments or docs that restate obvious code
```

## Git Safety

- Prefer adding a new commit over amending an existing commit.
- Never force-push.
