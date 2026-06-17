---
name: triage-pr-comments
description: Fetches and classifies pull request review feedback into a triage table without fixing code or posting replies. Use when review comments arrive, before address-pr-review, or when re-triaging after a reviewer responds.
---

# Triage PR Comments

Read-only pass over PR feedback. Produce a triage table for `address-pr-review`. **No code changes, no replies, no push.**

## Quick start

1. Fetch comments (same commands as `address-pr-review` → fetch-comments). For stacks, fetch all PRs.
2. Build triage table → [resources/triage-table.md](resources/triage-table.md).
3. Classify by reviewer type (`bot` | `human`) and blocking status.
4. Return table to `address-pr-review` — execution is autonomous unless interactive override.

## Hard rules

- **Read-only.** Do not commit, push, post, or edit the PR body.
- **Delta on round 2+.** Only treat comments with `ID > lastProcessedCommentId` as new; re-classify threads the reviewer replied on.
- **Reviewer type.** Infer `bot` from `[bot]` login suffix or known bot accounts; else `human`.
- **Resolved** — bot thread: reviewer (bot) confirmed fix in-thread **or** thread marked resolved on GitHub. Human thread: human reviewer replied accepting **or** thread marked resolved. No reply = `addressed`, not `resolved`.
- **Normalize `@mention`** from `USER:` (strip `[bot]` suffix) — record both in the table; never suggest `@…[bot]` in draft replies.

## Thread status

| Status | Meaning |
|--------|---------|
| `open` | Actionable; not yet addressed this round |
| `needs-user` | Tradeoff or ambiguous — ping user before acting |
| `addressed` | Fix/reply posted; **waiting for reviewer** |
| `resolved` | Reviewer accepted or thread marked resolved on GitHub |
| `noise` | Vercel, duplicate bot summary — skip |

## Classification (maps to proposed action)

| Class | Agent action (autonomous mode) |
|-------|--------------------------------|
| Straightforward fix | Code change + inline reply |
| Reply-only | Post draft reply (no code) |
| False-positive | Post rebuttal with evidence |
| Defer | Post defer reply |
| Needs-user | **Stop — ping user** with options |

See `address-pr-review` → triage-rules for classification criteria.

## Reply target (record in table)

| Source | Post via |
|--------|----------|
| Inline review comment | `pulls/comments/{id}/replies` or GraphQL `addPullRequestReviewThreadReply` |
| Issue comment (bot summary) | New issue comment with `@mention` |

## Output

1. Triage table (all non-`noise` threads) with `reviewer_type`, `scope_pr`, `blocking`.
2. **Ping list:** `needs-user` threads + human `open` threads where user has not replied.
3. **Autonomous batch:** bot `open` items ready to fix/reply (grouped by `scope_pr`).
4. **Waiting on reviewer:** `addressed` threads (human or bot) with no reviewer follow-up.
5. Round log line (watermark IDs, counts).

## Re-triage trigger

Run again when:

- A new `address-pr-review` round starts after fixes pushed.
- In-session poll detects new reviewer comment or a thread marked resolved.

## Related

Execution loop: `address-pr-review`. Fetch commands: `address-pr-review` → fetch-comments. Evidence refresh: `ship-pr`.
