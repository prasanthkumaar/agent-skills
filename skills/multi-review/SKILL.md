---
name: multi-review
description: Runs every review lane on the full branch diff using fresh-context read-only reviewer agents, then records raw findings in the review ledger. Use before PR creation, after branch fixes, before updating PR descriptions, or when the user asks for multi-review, multi-subagent review, or full stack review.
---

# Multi Review

Orchestrates read-only review lanes. It does not fix, reply, or update PR descriptions.

## Inputs

- Repo path.
- Branch or ordered stack.
- Parent branch for each branch.
- PR numbers and PR description URLs when available.
- Review ledger path, or permission to create one in OS temp.

## Review lanes

Run all lanes for every branch:

- `review-docs-check`
- `review-bug`
- `review-security`
- `review-codebase-standards`
- `review-pr-accuracy`

Each lane gets the whole branch diff against its parent, not changed-file slices.

## Stack order

Review bottom-up. If a child branch finding belongs in a parent, record the parent as owner so `triage` can route the fix before continuing upward.

## Ledger

Use [resources/review-ledger.md](resources/review-ledger.md).

- Create a ledger in OS temp if missing.
- Reuse the active ledger when repo, PR numbers, and branch stack match.
- Append raw findings only.
- Do not judge whether a finding is valid, a tradeoff, or already addressed. `triage` owns that.

## Output

Return a concise branch-by-branch summary plus the ledger path.

## Hard rules

- Read-only.
- Fresh-context reviewers.
- Reviewer agents never edit, push, comment, resolve threads, or update PR bodies.
