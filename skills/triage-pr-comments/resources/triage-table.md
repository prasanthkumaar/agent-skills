# Triage table

Build this after every fetch. Store round state in the session (comment IDs processed, trigger comment IDs, commit SHA when replies posted).

## Columns

| # | ID | Source | USER | @mention | reviewer_type | scope_pr | Location | Summary | Class | blocking | Status | Reply target |
|---|-----|--------|------|----------|---------------|----------|----------|---------|-------|----------|--------|--------------|
| 1 | 3373843476 | inline | `claude[bot]` | `@claude` | bot | #157 | `error.ts:22` | bare 4xx enum | straightforward | yes | open | `replies/3373843476` |

**Source:** `inline` | `issue` | `review-summary`

**reviewer_type:** `bot` | `human` — bot if login ends with `[bot]` or is a known automation account.

**scope_pr:** PR number that owns the fix (important for stacks).

**Class:** straightforward | reply-only | false-positive | defer | needs-user | noise

**blocking:** `yes` | `no` — bot actionable vs minor/non-blocking; human `REQUEST_CHANGES` → yes.

**Status:** open | needs-user | addressed | resolved | noise

## Delta fetch (round 2+)

Track `lastProcessedCommentId` and `lastTriggerCommentId` from the prior round.

- **New:** comment ID after watermark → classify as `open` (or `needs-user`).
- **Same thread, new reply from reviewer:** re-open or move to `resolved` / new `open` finding depending on body.
- **Our reply posted, no reviewer follow-up:** stay `addressed` — **not** `resolved`.
- **Bot confirmed fix in-thread:** → `resolved` (autonomous mode may auto-resolve on GitHub).
- **GitHub thread resolved:** → `resolved`.

## Resolved detection

**Bot thread → `resolved` when:**

1. Bot posted confirmation in-thread (e.g. "Confirmed fixed in `{sha}` ✅"), **or**
2. Thread marked resolved on GitHub, **or**
3. Latest bot issue comment on that PR is LGTM with no blocking section for this finding.

**Human thread → `resolved` when:**

1. Human reviewer posted follow-up accepting the fix, **or**
2. Thread marked resolved on GitHub.

Until then, after we post a reply, status = **`addressed`**.

Do **not** mark resolved because: CI passed, no new comments for N minutes, or agent believes the fix is correct.

## Present / hand off

**Order for ping list:**

1. **`needs-user`** — full context + options (see `address-pr-review` → resolution-interview).
2. **Human `open`** where user has not replied — ping immediately.

**Autonomous batch (bot only):**

3. Bot **`open`** — one-line summary + class + proposed fix/reply (executed without per-item OK in default mode).

**Status summary:**

4. **`addressed`** — waiting on reviewer (does not block bot-clean exit for human threads user already answered).
5. **`resolved`** — brief note.
6. Skip **`noise`** unless asked.

Interactive override: present autonomous batch as drafts and wait for OK before act.

## Round log (session)

```text
Round 1 | stack #225→#232→#241 | watermark: none | bot open: 2 | needs-user: 1 | human unreplied: 0
Round 2 | stack #225→#232→#241 | watermark: 4729063199 | bot open: 0 | addressed: 1 | resolved: 3
```
