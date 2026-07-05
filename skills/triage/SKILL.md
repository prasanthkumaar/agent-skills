---
name: triage
description: Classifies all actionable inputs for a PR or stack without editing code or posting replies, including multi-review findings, GitHub comments, CI failures, chat feedback, manual verification issues, and stale PR body evidence. Use before fix-and-verify or whenever feedback needs judgement.
---

# Triage

Read-only intake and judgement skill.

## Inputs

- Review ledger from `multi-review`.
- GitHub comments or review threads.
- CI failures.
- User chat feedback.
- Manual or browser verification notes.
- PR accuracy or stale evidence issues.

## Process

1. Gather all current inputs.
2. Deduplicate by branch, location, and root cause.
3. Decide owner branch. For stacks, route parent issues to the earliest branch that owns the problem.
4. Judge each item.
5. Update the review ledger format from `../multi-review/resources/review-ledger.md`.

## Judgements

- `fix`
- `acceptable-tradeoff`
- `false-positive`
- `reply-only`
- `needs-user`
- `already-addressed`

## Tradeoffs

Triage must decide whether an issue is an acceptable tradeoff when evidence is enough. Use `needs-user` only for product behaviour, security, data, architecture, PR scope, or unclear user preference.

## Output

Return an action table with source, branch or PR owner, issue, judgement, evidence needed, next action, and whether `fix-and-verify` can act autonomously.

## Hard rules

- Read-only.
- Do not fix code.
- Do not post replies.
- Do not resolve GitHub threads.
