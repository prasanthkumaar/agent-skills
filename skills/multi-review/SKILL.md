---
name: multi-review
description: Runs every review lane on the full branch diff using fresh-context read-only reviewer agents, then deduplicates and records decision-ready findings in the review ledger. Use before PR creation, after branch fixes, before updating PR descriptions, or when the user asks for multi-review, multi-subagent review, or full stack review.
---

# Multi Review

Runs read-only review lanes. It does not fix, reply, or update PR descriptions.

## Inputs

- Repo path.
- Branch or ordered stack.
- Parent branch for each branch.
- PR numbers and PR description URLs when available.
- Review ledger path, or permission to create one in OS temp.

## Review lanes

Before global lanes, find repo-local review skills:

- Look for `SKILL.md` files under `./.agents/skills/review-*` and `./.claude/skills/review-*` in the target repo.
- Read each local review skill before spawning its reviewer.
- Run matching local review skills as extra read-only lanes for every branch. For example, run repo-local `review-typescript` when the branch touches TypeScript or TSX files.
- If the local skill's trigger scope is unclear, run it and evaluate its findings during consolidation.
- If `.agents` and `.claude` contain the same review skill with identical Markdown, run it once and record both source paths. If the contents differ, run both as separate local lanes.
- Local review skills add repo-specific judgement. They do not replace the global lanes below.

Run all global lanes for every branch:

- `review-docs-check`
- `review-bug`
- `review-security`
- `review-code-quality`
- `review-spec`
- `review-pr-accuracy`

Each lane gets the whole branch diff against its parent, not changed-file slices.

## Stack order

Review bottom-up. If a child branch finding belongs in a parent, record the parent as owner before review continues upward.

## Ledger

Use [resources/review-ledger.md](resources/review-ledger.md).

- Create a ledger in OS temp if missing.
- Reuse the active ledger when repo, PR numbers, and branch stack match.
- Migrate a matching older ledger to the current format before reuse, preserving finding IDs and evidence.
- Preserve a finding's stable ID when the same underlying issue appears again. When merging duplicates, keep the earliest existing ID as canonical.
- Deduplicate findings that describe the same failure, location, and required action. Merge their evidence and reviewer sources.
- Judge every finding as `fix`, `acceptable-tradeoff`, `false-positive`, `reply-only`, `needs-user`, or `already-addressed`.
- Set its status, owner branch, trade-off, and concrete next action.
- Use `needs-user` only when the evidence cannot settle a product, security, data, architecture, PR-scope, or user-preference decision.

## Output

Return the ledger path and a concise branch-by-branch action table with:

- stable finding ID
- recommendation and why
- benefit, cost, or risk of that recommendation
- owner branch
- next action

Group IDs into `fix now`, `reply only`, `needs user`, and `no action`. The user can pass selected IDs directly to `fix-and-verify`.

## Hard rules

- Read-only.
- Fresh-context reviewers.
- Reviewer agents never edit, push, comment, resolve threads, or update PR bodies.
