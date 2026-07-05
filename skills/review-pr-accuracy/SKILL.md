---
name: review-pr-accuracy
description: Reviews whether each PR description, screenshots, and evidence exactly match that branch's diff. Use inside multi-review after PRs exist, before marking ready for review, or when the user worries that PR bodies or images are stale, overstated, or from the wrong branch.
---

# Review PR Accuracy

Read-only PR accuracy review lane.

## Process

1. Read the branch diff against its parent.
2. Read that branch's PR description when a PR exists.
3. Read evidence manifest entries for that branch when available.
4. Compare claims, screenshots, and verification notes against the actual branch diff.

## Findings

Flag:

- code changes missing from the PR description
- PR claims not present in the diff
- screenshots or evidence from a downstream or unrelated branch
- stale verification after code changes
- jargon that hides the user-visible reason for the change
- missing PR-template sections

## Output

For each finding include:

- branch and PR
- inaccurate or missing claim
- evidence from diff, PR body, or manifest
- required correction
- suggested triage judgement if obvious

## Hard rules

- Read-only.
- If no PR exists yet, report `not-applicable` unless a draft PR description was provided.
