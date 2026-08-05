---
name: docs-check
description: Verifies planned or implemented framework, library, SDK, API, CLI, cloud-service, configuration, test, and story patterns against version-matched first-party documentation. Use automatically before writing or approving code, plans, or technical decisions that introduce or change an external documented pattern; skip purely repository-local logic.
---

# Docs Check

Read-only gate for documented implementation patterns.

## Trigger boundary

Run before code, plans, or decisions commit to an external documented pattern.
Do not run for business logic, local algorithms, renames, or other purely
repository-local work with no external contract.

## Workflow

1. Identify the exact external product, installed version, pattern being changed, and any repository wrapper or public contract.
2. Fetch version-matched first-party documentation. Use Context7 second for retrieval, snippets, or version-specific examples.
3. Compare the documented pattern with the current or planned implementation.
4. Select the documented pattern or classify a necessary deviation.
5. Return source-backed rows only. No source link, no docs-conformance claim.

## Documentation contract

- Treat first-party documentation for the installed version as canonical when it satisfies the repository contract.
- Follow documented syntax, fields, nesting, composition, lifecycle, generators, and CLI requirements exactly.
- Do not substitute a familiar local pattern when it conflicts with current documentation.
- Allow a deviation only for a verified version difference, intentional repository wrapper or public contract, inability to satisfy the requested behaviour, or a compatibility, security, or measured performance constraint.
- Keep an allowed deviation as narrow as possible and state the documented alternative, reason, and evidence.
- Return `needs-user` when missing evidence or a material trade-off prevents a documented decision.

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
- Ask the user only when the unresolved trade-off affects product behaviour, security, data, architecture, or PR scope.
- Do not edit files.

## Handoff

The implementing agent or `fix-and-verify` applies the decision. When
installed, `multi-review` can independently audit the resulting diff through
its standalone documentation-conformance lane.
