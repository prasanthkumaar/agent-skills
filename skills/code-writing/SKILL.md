---
name: code-writing
description: Writes and refactors code so it reads top-down like a clear document, with explicit contracts, domain names, and boring control flow. Use before editing code in any repo, especially when readability, documented patterns, comments, or small scoped changes matter.
---

# Code Writing

## Overview

Write code that reads like a clear document. Length is acceptable when the reader can follow the story top-down: domain names, explicit variables, boring control flow, local context nearby, and helpers only when they reduce real complexity.

Read [references/rules.md](references/rules.md) before editing. Use it as the working checklist.

## Workflow

1. State assumptions before editing. If the task is ambiguous, stop and ask.
2. Define proof of success and the check that will verify it.
3. Inspect the file and nearby files first. Preserve established patterns unless the user is explicitly changing them.
4. If touching framework, library, API, config, test, or story patterns, run `docs-check` first. If it returns `needs-user`, ask before editing.
5. Load language or framework skills when the files demand it, for example TypeScript or React guidance for `.ts` and `.tsx`.
6. Make the smallest change that satisfies the request. Do not add speculative flexibility, unrelated refactors, or adjacent cleanup.
7. Tighten the contract at the source boundary. Parse external data early, normalise once, and throw clear errors instead of silently skipping.
8. Structure the file for scanning. Prefer:

```text
imports
types
consts
main function
helper functions below
```

9. Choose the simplest structure that matches the problem. Add a helper, wrapper type, or extra layer only when it clearly improves readability or correctness.
10. Name things by domain meaning and role. Keep transport or API-specific names at the boundary.
11. Remove only unused imports, variables, or functions created by your change.
12. Add comments only for non-obvious why, config, documented deviations, or workaround links. Keep them plain and short.
13. Verify after edits using the repo’s required checks and report the proof.

## Default Decisions

Prefer these defaults:

```text
readable document-shaped code > dense clever code
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

## Comments

- Comments are rare.
- Required when config or framework glue is non-obvious.
- Required when code intentionally uses an acceptable deviation from documented patterns.
- Explain why this option was used over the main alternative.
- Include the documentation or workaround link when relevant.
- Use plain language and no jargon.
