---
name: docs-check
description: Checks framework, library, API, config, test, and story patterns against documented sources without editing code. Use before coding or reviewing non-obvious external patterns, config glue, Storybook stories, testing setup, or intentional deviations from documented practice.
---

# Docs Check

Read-only gate for documented implementation patterns.

## Quick start

1. Identify the exact library, framework, API, config, test, or story pattern being changed.
2. Fetch official docs first. Use Context7 second for retrieval, snippets, or version-specific examples.
3. Compare the documented pattern to current or planned code.
4. Return source-backed rows only. No source link, no docs-conformance claim.

## Output

| Area/file | Documented pattern | Source link | Status | Judgement | Comment needed | Suggested comment |
|-----------|--------------------|-------------|--------|-----------|----------------|-------------------|

Statuses:

- `follows`
- `deviates`
- `unclear`

Judgements:

- `follow`
- `acceptable-deviation`
- `needs-user`

## Rules

- Every row must include a source link.
- `acceptable-deviation` must name the main documented alternative that was rejected and why.
- Suggest a code comment only for non-obvious config, framework glue, workaround, or intentional deviation.
- Comments must be plain English, a few readable lines at most, and include the source link when useful.
- Ask the user only when the tradeoff affects product behaviour, security, data, architecture, or PR scope.
- Do not edit files.

## Handoff

`code-writing` or `fix-and-verify` implements the decision. `review-docs-check` independently audits it later.
