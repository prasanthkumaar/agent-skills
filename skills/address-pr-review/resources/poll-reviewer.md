# Poll for reviewer activity (in-session)

Run after a round where fixes were pushed and reply drafts were **posted with user OK**. Do not declare merge-ready until triage shows no `open` / `needs-user` and no `addressed` threads still awaiting reviewer reply.

## When to poll

- User approved push + thread replies in this session.
- At least one thread is `addressed` (waiting on reviewer), **or** user asked to wait for bot/human re-review.

## How to poll

1. Record watermark: highest comment `ID` and `created_at` after your posts.
2. Loop (in-session — stay in the same agent turn unless user stops you):

```bash
# Inline + issue comments (re-run fetch from fetch-comments.md)
gh api repos/{owner}/{repo}/pulls/{number}/comments --paginate -q '…'
gh api repos/{owner}/{repo}/issues/{number}/comments --paginate -q '…'
```

3. Compare to watermark. **Stop polling early** when user says stop.

**Backoff:** 30s → 60s → 120s between checks (state max rounds or time budget in chat).

## On new activity

1. Stop poll loop.
2. Load **`triage-pr-comments`** — delta triage only (new reviewer replies, newly resolved threads).
3. Present results to user → wait for OK on any new work.
4. Start next **`address-pr-review`** round.

## On no activity

- Threads stay **`addressed`** — not merge-ready.
- Tell user what is still waiting (thread list + `@mention`).
- Offer: keep polling, stop for now, or user will re-invoke later.

## Merge-ready (all required)

- Triage: zero `open`, zero `needs-user`.
- Zero `addressed` still awaiting reviewer (all `resolved` or no actionable threads left).
- CI green on PR head.
- Human `APPROVE` if branch protection requires it.
