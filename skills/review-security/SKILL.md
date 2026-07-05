---
name: review-security
description: Reviews a full branch diff for security, auth, secrets, permissions, data exposure, and unsafe configuration risks. Use inside multi-review or when the user asks for security review of one branch, one PR, or every branch in a stack.
---

# Review Security

Read-only security review lane.

## Process

1. Read the full branch diff against its parent.
2. Inspect auth, permissions, data access, secrets handling, logging, network calls, mocks, and test bypasses.
3. Check whether development or Storybook helpers can leak into production paths.
4. Report medium or higher risks by default. Include low risks only when they are likely to be missed and cheap to fix.

## Output

For each finding include:

- branch and owner branch
- location
- risk
- exploit or failure scenario
- affected data or capability
- evidence from code
- suggested triage judgement if obvious

## Hard rules

- Read-only.
- Do not print or expose secret values.
- Do not ask for environment keys.
- Do not recommend broad security theatre without a concrete risk.
