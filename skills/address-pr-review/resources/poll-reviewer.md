# Poll for reviewer activity (in-session)

Run after fixes were pushed and replies posted. Loop until new bot activity or exit conditions met.

## When to poll

- After autonomous act round (fixes + replies + optional bot re-review trigger).
- After posting a bot re-review trigger (root comment with `@<mention> please re-review`) on stack PR(s).

## How to poll

1. Record watermarks: highest comment `ID` after trigger posts; note time.
2. Loop in-session (stay in the same agent turn unless user stops):

```bash
# Per PR in stack — issue comments (use ID threshold, not since= alone)
gh api repos/{owner}/{repo}/issues/{number}/comments?per_page=100 \
  --jq '.[] | select(.id > LAST_TRIGGER_ID) | {id, user: .user.login, body}'

# Unresolved inline threads
gh api graphql -f query='… reviewThreads … isResolved …'
```

3. Check **both** issue comments and unresolved threads — inline bot replies may arrive after issue summary.
4. **Backoff:** 30–45s between checks; ~2–3 minutes per round before re-trigger or exit.
5. Stop early when user says stop.

## On new bot activity

1. Stop poll loop.
2. Load **`triage-pr-comments`** — delta triage only (new IDs / threads).
3. If blocking bot items → autonomous act round (or wait for OK in interactive mode).
4. If only LGTM / non-blocking → loop complete → [loop-summary.md](loop-summary.md).

## On no new activity

- If prior round had open bot items and enough time passed → consider one re-trigger, then poll again.
- If bot issue comments show LGTM on all PRs and no open blocking bot threads → loop complete.

## Exit gates

**Loop complete (ping user + summary):**

- No open blocking **bot** threads.
- Latest bot issue comment on each PR: LGTM / non-blocking.

**Merge-ready (separate — do not conflate with loop complete):**

- No human threads awaiting reviewer.
- CI green; required approvals; evidence current if needed.

## Multi-PR stacks

Poll all PRs in one round. See [stack-orchestration.md](stack-orchestration.md).
