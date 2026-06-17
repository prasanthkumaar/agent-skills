# Triage rules

Classify each thread during **`triage-pr-comments`**. In default autonomous mode, bot classifications authorize act without per-item OK. Human tradeoffs and unreplied human threads → ping user.

**Replies** start with normalized **`@mention`** — see [fetch-comments.md](fetch-comments.md).

## Straightforward fix

All must be true:

- Single clear correct behaviour (bug, typo, missing guard, wrong copy).
- No product tradeoff.
- Fits PR scope.

**Autonomous:** implement + inline reply with commit SHA.

## Needs-user → ping user

Any of:

- Multiple valid implementations with different UX or data semantics.
- Security vs convenience.
- Scope expansion.
- Disagreement with PR design decisions.

**Status:** `needs-user`. Ping user with options; stop autonomous act until decided.

## Reply-only

- Intentional design, v1 scope.
- Already fixed in latest commit (verify in diff).
- Answered by PR description.

**Autonomous (bot):** post reply. **Human:** post only after user has decided if tradeoff involved.

## Defer

- Out of scope for this PR.

**Autonomous (bot):** post defer reply.

## False-positive (bot)

- Claim wrong vs code/tests.

**Autonomous:** post rebuttal with evidence.

## Bot comments

Validate against code and tests — do not blindly classify as straightforward fix. Mark `blocking: no` when bot labels finding minor/non-blocking.

## Human comments

- Unreplied question or `REQUEST_CHANGES` → ping user if they have not replied.
- User already replied → `addressed`; does not block bot-clean loop exit.

## Priority (autonomous act order)

1. Human ping list (stop — user must act).
2. Bot blocking correctness / CI tied to comment.
3. Bot nits marked blocking.
4. Bot reply-only / false-positive.

## Reviewer type

| Signal | `reviewer_type` |
|--------|-----------------|
| Login ends with `[bot]` | `bot` |
| Known automation (Vercel, Graphite, Bugbot summaries) | `noise` or `bot` per context |
| Otherwise | `human` |

## After classification

Record in triage table. Hand off to `address-pr-review` for autonomous act or user ping.
