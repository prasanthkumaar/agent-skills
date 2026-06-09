---
name: address-pr-review
description: Runs the pull request review loop — triage, user-approved fixes and replies, evidence refresh, push, and in-session poll until reviewers respond. Requires triage-pr-comments and ship-pr. Use when addressing PR feedback or when the user says address PR review.
---

# Address PR Review

Multi-round loop: **triage → user OK → act → poll → re-triage**. Exit merge-ready only when triage shows no open work and no threads awaiting reviewer reply.

## Quick start

1. Load **`triage-pr-comments`** — fetch and classify (read-only).
2. Present **`needs-user`** threads + proposed drafts for everything else — **wait for your OK**.
3. On OK: fix → refresh evidence (if code changed) → push → post replies.
4. **Poll in-session** for reviewer activity → re-triage → repeat.

## Hard rules

- **Triage first every round** — load `triage-pr-comments` before any fix or reply.
- **Your OK on everything** — no commit, push, PR body edit, or thread reply without explicit approval (including straightforward fixes and reply-only).
- **`needs-user` only** — use resolution-interview for tradeoffs/ambiguous threads; do not interview on straightforward items unless you ask for options.
- **Resolved** only when reviewer comments back or thread is marked resolved on GitHub — see `triage-pr-comments` → triage-table.
- **After any code change:** full evidence refresh per [refresh-evidence.md](resources/refresh-evidence.md) (`ship-pr` pipeline).
- **Replies** — normalized `@mention` on inline threads via `replies` API; see [fetch-comments.md](resources/fetch-comments.md).
- **Do not resolve threads** on GitHub unless you ask.

## Anti-patterns

- Fixing or posting before triage or before your OK.
- Marking threads `resolved` without reviewer reply or GitHub resolved state.
- Exiting merge-ready while threads are still `addressed` (waiting on reviewer).
- Polling in background without in-session loop semantics.
- `@…[bot]` in reply bodies.

## Workflow

### Round N

**1. Triage** — load `triage-pr-comments`; build table ([triage-table.md](../triage-pr-comments/resources/triage-table.md) in that skill).

**2. Present & wait**

- `needs-user` → [resolution-interview.md](resources/resolution-interview.md) (options only).
- `open` → proposed fix and/or **draft reply** (not posted).
- `addressed` → note still waiting on reviewer.
- **Stop. Wait for your OK** on each proposed action.

**3. Act (only after OK)**

- Scoped fixes → [triage-rules.md](resources/triage-rules.md).
- Evidence refresh if code changed → [refresh-evidence.md](resources/refresh-evidence.md).
- Push → `ship-pr` git-push policy (`--force-with-lease`).
- Post approved replies → [fetch-comments.md](resources/fetch-comments.md); mark threads **`addressed`**.

**4. Poll** → [poll-reviewer.md](resources/poll-reviewer.md) (in-session until new activity or you stop).

**5. Round N+1** — on new reviewer comment or resolved thread: go to step 1 (delta triage).

### Merge-ready exit

- [ ] Triage: no `open`, no `needs-user`, no `addressed` awaiting reviewer.
- [ ] CI green on PR head.
- [ ] Human approve if required.
- [ ] PR description evidence current if code changed this loop.

## Related

Triage: `triage-pr-comments`. Open PR: `ship-pr`. CI-only: `babysit`.
