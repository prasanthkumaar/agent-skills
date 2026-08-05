---
name: fix-and-verify
description: Implements explicitly selected code issues using the requested fix approach, then runs relevant verification. Use when the user supplies issues to fix and how to address them, with an optional review ledger to update.
---

# Fix And Verify

Fixes only the issues the user selected. It works without `multi-review` or any
review ledger.

## Inputs

Required:

- repository and branch when not already clear
- issue and location
- chosen fix approach

Optional:

- review ledger path
- explicit finding ID for each selected issue

Direct instructions define the work. A ledger supplies context and receives
status updates, but never expands the requested scope.

## Process

1. Confirm every requested issue and chosen approach is concrete.
2. If one mechanical fix is clear, proceed without asking for redundant
   detail.
3. Ask when the missing choice would materially affect behaviour,
   architecture, security, data, or scope.
4. Batch issues by their owner branch when working on a stack.
5. Assign a fresh-context fix agent to each branch batch when useful.
6. Fix parent branches before child branches.
7. Implement only the selected issues.
8. Run the strongest practical checks for the changed code.
9. Report changed files, issues fixed, and verification evidence.

## Optional ledger update

When a ledger and explicit finding IDs are provided:

- Treat the direct issue and chosen approach as the source of truth.
- Never act on extra ledger findings.
- Set a selected finding to `fixed` only after relevant checks pass.
- Never match findings by similar text.
- If the ledger is missing, malformed, or incompatible, continue the fix,
  skip the update, and report why.

## Commit and push

Do not commit or push unless the user explicitly asks. Never use bare
`--force`.

## Hard rules

- Do not post replies, update PR descriptions, or resolve threads.
- Do not claim fixed without fresh verification evidence.
- Do not change an unselected issue merely because it appears in a ledger.
