---
name: multi-review
description: Runs every review lane on the full branch diff using fresh-context read-only reviewer agents, then records raw findings in the review ledger. Use before PR creation, after branch fixes, before updating PR descriptions, or when the user asks for multi-review, multi-subagent review, or full stack review.
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
- If the local skill's trigger scope is unclear, run it and record raw findings. `triage` owns validity decisions.
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

Review bottom-up. If a child branch finding belongs in a parent, record the parent as owner. `triage` can route the fix before review continues upward.

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
