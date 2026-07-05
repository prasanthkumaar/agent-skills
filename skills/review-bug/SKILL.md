---
name: review-bug
description: Reviews a full branch diff for functional bugs, edge cases, regressions, and runtime failures. Use inside multi-review or when the user asks for bugbot-style review of one branch, one PR, or every branch in a stack.
---

# Review Bug

Read-only bug review lane.

## Process

1. Read the full branch diff against its parent.
2. Read nearby code needed to understand behaviour.
3. Look for runtime failures, incorrect state, broken edge cases, async races, stale assumptions, and missing tests.
4. Ignore style-only issues unless they hide a real bug.

## Output

For each finding include:

- branch and owner branch
- location
- bug summary
- user-visible or developer-visible impact
- evidence from the diff or nearby code
- minimal reproduction or failing scenario when possible
- suggested triage judgement if obvious

## Hard rules

- Read-only.
- No speculative findings without a concrete failure path.
- Prefer fewer high-confidence findings over broad guesses.
