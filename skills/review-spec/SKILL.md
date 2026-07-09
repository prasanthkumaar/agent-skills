---
name: review-spec
description: Reviews a full branch diff against the originating issue, PRD, ticket, or spec to catch missing requirements, scope creep, and wrong implementations. Use inside multi-review or when the user asks whether a branch matches the spec, issue, ticket, PRD, or requested behaviour.
---

# Review Spec

Read-only spec review lane. Adapted from Matt Pocock's Spec axis:
https://github.com/mattpocock/skills/blob/main/skills/engineering/code-review/SKILL.md

## Process

1. Pin the fixed point from the branch parent or user-supplied ref.
2. Capture the diff command once, usually `git diff <fixed-point>...HEAD`, so the comparison is against the merge base.
3. Note the commits via `git log <fixed-point>..HEAD --oneline`.
4. Confirm the fixed point resolves and the diff is non-empty before reviewing.
5. Find the originating spec source.
6. Check that the diff implements the originating issue, PRD, ticket, or spec.

## Spec Sources

Look for the originating spec in this order:

1. Issue references in commit messages, branch names, or PR body, such as `#123`, `Closes #45`, GitLab `!67`, or ticket IDs.
2. A path or URL the user passed as an argument.
3. A PRD or spec file under `docs/`, `specs/`, `plans/`, or `.scratch/` matching the branch name or feature.
4. The PR description when no stronger spec is available.
5. No spec available.

If no spec is found, report `not-applicable: no spec available`. Do not invent requirements.

## Findings

Report:

- requirements the spec asked for that are missing or partial
- behaviour in the diff that was not asked for
- requirements that seem done but are wrong
- conflicts between PR body claims and the actual spec

Quote the spec line, ticket text, PR claim, or file path for each finding.

## Output

For each finding include:

- branch and owner branch
- location
- spec source
- finding summary
- quoted requirement or claim
- diff evidence
- suggested triage judgement if obvious

## Hard Rules

- Read-only.
- Review the full branch diff against its parent, not changed-file slices.
- Do not edit, push, comment, resolve threads, or update PR bodies.
- Do not report a finding without a cited spec, ticket, PR claim, or `no spec available`.
