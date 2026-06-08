# Locked spec contract

The locked spec is the handoff artifact from a design session into `ship-pr`. It must exist and be user-approved before implementation starts.

## Required sections

```markdown
## Problem
What is broken or missing today? Who is affected?

## Solution
What will change at a high level?

## Design decisions
Numbered or bulleted decisions only — no session meta ("we grilled on…", "option B from canvas").

## Happy paths
| ID | Steps | Expected UI / behaviour | Test |
|----|-------|-------------------------|------|
| H1 | … | … | `npm run test:e2e -- …` or manual script |

## Edge cases
| ID | Steps | Expected UI / behaviour | Test |
|----|-------|-------------------------|------|
| E1 | … | … | … |

## Out of scope
Explicit non-goals for this PR.
```

## Rules

- Every happy-path and edge-case row must be **testable** and **screenshot-able**.
- IDs (`H1`, `E1`) are stable — they appear in Test plan and Screenshots tables in the PR.
- Wording in **Design decisions** is copied into the PR body (cleaned of meta only).
- If the user skipped edge cases, stop and ask before shipping.

## Optional appendix

```markdown
## Verification commands (discovered)
- Dev: `…`
- Test: `…`
- Lint: `…`
```

Fill this during preflight if not already known.

## Emitting from a design session

At the end of a spec/design session, write this artifact to a scratch file or paste into chat. User must confirm: **"Spec locked"** before `ship-pr` implements.
