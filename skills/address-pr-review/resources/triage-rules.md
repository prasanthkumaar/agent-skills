# Triage rules

Classify each thread during **`triage-pr-comments`**. These rules do **not** authorize implementation or posting — `address-pr-review` waits for user OK on every action.

**Replies** (when user approves) start with normalized **`@mention`** — see [fetch-comments.md](fetch-comments.md).

## Straightforward fix

All must be true:

- Single clear correct behaviour (bug, typo, missing guard, wrong copy).
- No product tradeoff.
- Fits PR scope.

**Propose:** code change summary + draft inline reply with commit SHA placeholder. **Do not implement until user OK.**

## Needs-user → stop in triage

Any of:

- Multiple valid implementations with different UX or data semantics.
- Security vs convenience.
- Scope expansion.
- Disagreement with PR design decisions.

**Status:** `needs-user`. Present options; wait for pick before drafting final reply.

## Reply-only

- Intentional design, v1 scope.
- Already fixed in latest commit (verify in diff).
- Answered by PR description.

**Propose:** draft reply only. **Do not post until user OK.**

## Defer

- Out of scope for this PR.

**Propose:** draft defer reply. **Do not post until user OK.**

## False-positive (bot)

- Claim wrong vs code/tests.

**Propose:** draft rebuttal with evidence. **Do not post until user OK.**

## Bot comments

Validate against code and tests — do not blindly classify as straightforward fix.

## Priority

1. Human `REQUEST_CHANGES`.
2. Blocking correctness / CI tied to comment.
3. Bot nits (only if repo treats as blocking).

## After classification

Record in triage table. Hand off to `address-pr-review` for user presentation and approval gate.
