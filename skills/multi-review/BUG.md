# Bug Review Lane

Review the complete branch diff for functional failures.

## Process

1. Read the full diff against the fixed parent.
2. Read nearby code and tests needed to understand behaviour.
3. Check runtime paths, state transitions, edge cases, async races, stale
   assumptions, regressions, and missing tests that conceal a concrete failure.
4. Ignore style-only concerns.

## Evidence threshold

Report only a concrete failure path. Include a minimal scenario or
reproduction when practical. Prefer fewer high-confidence findings over broad
guesses.

## Finding

For each finding provide:

- location
- issue
- evidence from the diff or nearby code
- user-visible or developer-visible consequence if it is not addressed
- credible fix options and each option's trade-off
- recommended option and why

Return `no findings` when the lane completes without a supported issue.

## Hard rules

- Read-only.
- Do not report a possibility without explaining how it fails.
