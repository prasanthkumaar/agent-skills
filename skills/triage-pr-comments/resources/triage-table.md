# Triage table

Build this after every fetch. Store round state in the session (comment IDs processed, commit SHA when replies posted).

## Columns

| # | ID | Source | USER | @mention | Location | Summary | Class | Status | Reply target |
|---|-----|--------|------|----------|----------|---------|-------|--------|--------------|
| 1 | 3373843476 | inline | `claude[bot]` | `@claude` | `error.ts:22` | bare 4xx enum | straightforward | open | `replies/3373843476` |

**Source:** `inline` | `issue` | `review-summary`

**Class:** straightforward | reply-only | false-positive | defer | needs-user | noise

**Status:** open | needs-user | addressed | resolved | noise

## Delta fetch (round 2+)

Track `lastProcessedCommentId` or `lastProcessedAt` from the prior round.

- **New:** comment ID or created_at after watermark → classify as `open` (or `needs-user`).
- **Same thread, new reply from reviewer:** re-open or move to `resolved` / new `open` finding depending on body.
- **Our reply posted, no reviewer follow-up:** stay `addressed` — **not** `resolved`.
- **GitHub thread resolved:** → `resolved` (only if user asked to resolve, or reviewer resolved via UI).

## Resolved detection (strict)

A thread is **`resolved`** only when:

1. A **reviewer** (original `USER:` or human reviewer) posted a follow-up on that thread accepting the fix / with no further ask, **or**
2. The inline thread is **marked resolved** on GitHub.

Until then, after we post a reply, status = **`addressed`**.

Do **not** mark resolved because: CI passed, no new comments for N minutes, or agent believes the fix is correct.

## Present to user

**Order:**

1. **`needs-user`** — full thread context + options (see `address-pr-review` → resolution-interview).
2. **`open`** — one-line summary + proposed class + draft reply or fix summary (not posted).
3. **`addressed`** — "waiting on @mention" (reviewer has not replied).
4. **`resolved`** — brief note (reviewer accepted or thread resolved).
5. Skip **`noise`** in the user summary unless asked.

Then: **wait for explicit user OK** on each proposed fix, reply draft, and push. Nothing posts autonomously.

## Round log (session)

```text
Round 1 | PR #157 | watermark: none | open: 2 | needs-user: 1 | addressed: 0
Round 2 | PR #157 | watermark: 3377652073 | open: 0 | addressed: 2 | resolved: 1
```
