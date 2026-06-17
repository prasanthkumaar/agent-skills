---
name: address-pr-review
description: Runs the pull request review loop — triage, fix/reply, push, re-trigger bot review, poll until clean. Pings the user only on tradeoffs, unreplied human threads, or when done with a summary. Requires triage-pr-comments and ship-pr. Use when addressing PR feedback or when the user says address PR review.
---

# Address PR Review

Multi-round loop: **triage → act → poll → re-triage**. Default is **autonomous** — act on bot feedback without per-item OK. Ping only on tradeoffs, unreplied human threads, or loop completion ([loop summary](resources/loop-summary.md)). Interactive override: *"wait for my OK on each fix"* → present drafts first.

## Quick start

1. Load **`triage-pr-comments`** — fetch and classify (read-only).
2. **Ping immediately** if any human thread is `open`/`needs-user` and the user has not replied.
3. **Act** on bot `open` items without per-item OK; **stop and ping** on `needs-user`.
4. Push → post replies → auto-resolve bot threads when bot confirms fix.
5. Re-trigger bot re-review → **poll in-session** → repeat until bot-clean.

## Hard rules

- **Triage first every round** — load `triage-pr-comments` before any fix or reply.
- **Autonomous by default** — no per-item OK unless interactive override.
- **Ping when:** `needs-user` tradeoff; unreplied human thread; loop exits (always deliver [loop summary](resources/loop-summary.md)).
- **Bot-only autonomous act** — human threads already answered stay `addressed`; do not block bot-clean exit.
- **Two exit gates:** loop-complete (bot clean) vs merge-ready (human threads, approvals, CI, evidence) — see [loop-summary.md](resources/loop-summary.md).
- **After code change:** local checks before push; full evidence at merge-ready — [refresh-evidence.md](resources/refresh-evidence.md).
- **Replies:** normalized `@mention` — [fetch-comments.md](resources/fetch-comments.md). Auto-resolve **bot** threads on in-thread confirmation; never human.
- **Stack push:** Graphite if available, else safe restack + `ship-pr` — [stack-orchestration.md](resources/stack-orchestration.md).

## Anti-patterns

- Fix/post before triage · per-item OK in default mode · human `resolved` without reviewer reply
- Loop-complete with open blocking bot threads · background polling · `@…[bot]` mentions
- Bot re-review on wrong stack PR (bot scopes to that PR's diff only)

## Workflow

**Setup:** identify PR(s)/stack, map findings → owning branch bottom-up, load triage. Trigger `@claude please re-review after <summary>` on **each** stack PR; record comment IDs.

**Round N:** (1) Triage → [triage-table.md](../triage-pr-comments/resources/triage-table.md). (2) Gate — ping unreplied human or `needs-user` ([resolution-interview.md](resources/resolution-interview.md)); else act on bot `open`. (3) Fix → local checks → push → reply → auto-resolve confirmed bot threads. (4) Poll in-session — issue comments **and** threads ([poll-reviewer.md](resources/poll-reviewer.md)). (5) Delta triage on new bot activity → repeat.

**Exit:** bot-clean → ping + [loop summary](resources/loop-summary.md). Merge-ready is a separate follow-up gate.

## Related

Triage: `triage-pr-comments`. Open PR: `ship-pr`. CI-only: `babysit`.
