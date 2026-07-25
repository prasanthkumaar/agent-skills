# Spec Review Lane

Review the complete branch diff against its originating requirement.

## Find the spec

Use the strongest available source in this order:

1. Issue references in commit messages, branch names, or the PR body.
2. A path or URL supplied by the user.
3. A matching PRD or spec under `docs/`, `specs/`, `plans/`, or `.scratch/`.
4. The PR description when no stronger source exists.

Return `not-applicable: no spec available` only when no source exists. If a
source exists but cannot be accessed, return `incomplete`.

## Review

Check for:

- missing or partial requirements
- behaviour that was not requested
- requirements implemented incorrectly
- conflicts between PR claims and the source requirement

## Evidence threshold

Every finding must cite the requirement, ticket text, PR claim, or file path.
Do not invent requirements.

## Finding

For each finding provide:

- location
- issue
- cited requirement and diff evidence
- product or scope consequence if it is not addressed
- credible options and each option's trade-off
- recommended option and why

Return `no findings` when the lane completes without a supported mismatch.

## Hard rules

- Read-only.
- Review the full diff against the fixed parent.
