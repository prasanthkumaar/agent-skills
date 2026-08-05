# PR Accuracy Review Lane

Review whether the PR description and evidence match the complete branch diff.

## Applicability

- Return `not-applicable` when no PR or draft description exists.
- Return `incomplete` when a PR exists but its body or required evidence
  cannot be accessed.

## Process

1. Read the complete branch diff against its fixed parent.
2. Read the PR or draft description.
3. Read branch-specific evidence when available.
4. Compare every material claim, screenshot, and verification statement with
   the actual diff.

Check for missing changes, unsupported claims, downstream or unrelated
screenshots, stale verification, unclear user-visible rationale, and missing
required template sections.

## Finding

For each finding provide:

- location in the PR body, evidence, or diff
- issue
- mismatch evidence
- review or delivery consequence if it is not addressed
- credible correction options and each option's trade-off
- recommended option and why

Return `no findings` when the lane completes without a supported mismatch.

## Hard rules

- Read-only.
- Do not update the PR body or evidence.
