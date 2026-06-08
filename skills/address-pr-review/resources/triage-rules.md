# Triage rules

Classify each review thread before acting.

**All thread replies** (fix, reply-only, defer, bot pushback) must start with `@login` from the comment author — see [fetch-comments.md](fetch-comments.md).

## Straightforward fix → implement

All must be true:

- Single clear correct behaviour (bug, typo, missing guard, wrong copy).
- No product tradeoff (e.g. "lock vs allow edit" is **not** straightforward).
- Fix fits PR scope.

Action: fix → test affected matrix rows → reply `@login` + commit/file reference.

## Tradeoff → stop and ask

Any of:

- Multiple valid implementations with different UX or data semantics.
- Security vs convenience.
- Scope expansion ("also refactor X").
- Disagreement with locked design decisions in PR body.

Action: present 2–3 options with tradeoffs + sample code/snippet; **wait** for user choice. See [resolution-interview.md](resolution-interview.md).

## Reply only → no code

- Intentional design (honour system, v1 scope).
- Already fixed in latest commit.
- Question answered by docs or PR description.

Action: draft reply starting with `@login`; user approves; post. Still refresh evidence if description changed.

## Defer → acknowledge

- Out of scope for this PR.
- Follow-up issue needed.

Action: reply `@login` + defer rationale; offer follow-up issue if user wants.

## Bot comments

- Validate claim against code and tests — do not blindly apply.
- If invalid: reply `@login` explaining why, with evidence.
- If valid: same as straightforward fix.

## Priority

1. Request-changes from human reviewers.
2. Blocking bugs (CI, correctness).
3. Bot nitpicks and style (only if repo treats them as blocking).
