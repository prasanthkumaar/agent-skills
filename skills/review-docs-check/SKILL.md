---
name: review-docs-check
description: Reviews a full branch diff for documented framework, library, API, config, test, and story conformance using docs-check. Use inside multi-review or when the user asks whether a branch follows official docs, Context7-backed patterns, Storybook conventions, or documented config practice.
---

# Review Docs Check

Read-only review lane for documented pattern conformance.

## Process

1. Read the full branch diff against its parent.
2. Identify framework, library, API, config, test, and story pattern changes.
3. Use `docs-check` for each relevant pattern.
4. Flag only source-backed findings.

## Findings

Report:

- documented pattern not followed
- missing rationale for acceptable deviation
- confusing or jargon-heavy config comments
- missing source link where a comment explains non-obvious config or workaround
- branch-level risk when a child branch depends on a parent pattern fix

## Output

For each finding include:

- branch and owner branch
- location
- source link
- expected documented pattern
- current code behaviour
- why it matters
- suggested triage judgement if obvious

## Hard rules

- Read-only.
- No finding without a source link.
- Do not rewrite comments yourself.
