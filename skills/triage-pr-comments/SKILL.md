---
name: triage-pr-comments
description: Fetches and classifies pull request review feedback into a triage table without fixing code or posting replies. Use when review comments arrive, before address-pr-review, or when re-triaging after a reviewer responds.
---

# Triage PR Comments

Read-only pass over PR feedback. Produce a triage table the user and `address-pr-review` act on. **No code changes, no replies, no push.**

## Quick start

1. Fetch comments (same commands as `address-pr-review` → fetch-comments).
2. Build triage table → [resources/triage-table.md](resources/triage-table.md).
3. Present **`needs-user`** threads first, then proposed handling for everything else.
4. Stop — wait for user OK before any fix, reply, or push (`address-pr-review` owns execution).

## Hard rules

- **Read-only.** Do not commit, push, post, or edit the PR body.
- **Delta on round 2+.** Only treat comments newer than the last processed `ID` or timestamp as `new`; re-classify threads the reviewer replied on.
- **Resolved** only when the reviewer commented back on that thread **or** GitHub marks the thread resolved. No reply = still `addressed`, not `resolved`.
- **Normalize `@mention`** from `USER:` (strip `[bot]` suffix) — record both in the table; never suggest `@…[bot]` in draft replies.

## Thread status

| Status | Meaning |
|--------|---------|
| `open` | Actionable; not yet addressed this round |
| `needs-user` | Tradeoff or ambiguous — user picks approach before anything runs |
| `addressed` | Fix/reply proposed or posted; **waiting for reviewer** |
| `resolved` | Reviewer replied accepting, or thread marked resolved on GitHub |
| `noise` | Vercel, duplicate bot summary — skip |

## Classification (maps to proposed action)

| Class | Agent proposes | User OK required before |
|-------|----------------|-------------------------|
| Straightforward fix | Code change + inline reply draft | Implement + post |
| Reply-only | Draft reply (no code) | Post |
| False-positive | Draft rebuttal with evidence | Post |
| Defer | Draft defer reply | Post |
| Needs-user | Options A/B/C | Pick, then draft + implement |

See `address-pr-review` → triage-rules for classification criteria.

## Reply target (record in table)

| Source | Post via |
|--------|----------|
| Inline review comment | `pulls/comments/{id}/replies` |
| Issue comment (bot summary) | New issue comment with `@mention` |

## Output

1. Triage table (all non-`noise` threads).
2. **User checkpoint:** list of `needs-user` threads only (full options in body).
3. **Proposed batch:** drafts for `open` straightforward / reply-only / false-positive / defer — **do not post**.
4. **Waiting on reviewer:** list of `addressed` threads with no reviewer reply yet.

## Re-triage trigger

Run again when:

- User starts a new `address-pr-review` round after approving work.
- In-session poll detects new reviewer comment or a thread marked resolved.

## Related

Execution loop: `address-pr-review`. Fetch commands: `address-pr-review` → fetch-comments. Evidence refresh: `ship-pr`.
